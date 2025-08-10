import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
    const clientId = process.env.REPL_ID!;
    console.log('OAuth config - Issuer URL:', issuerUrl);
    console.log('OAuth config - Client ID:', clientId);
    
    return await client.discovery(
      new URL(issuerUrl),
      clientId
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: true, // Important: create sessions for OAuth flow
    rolling: true, // Reset expiry on activity
    cookie: {
      httpOnly: true,
      secure: false, // Disable secure cookies for localhost development
      maxAge: sessionTtl,
      sameSite: 'lax', // Allow cross-site requests for OAuth flow
      path: '/', // Ensure cookie works for all paths
    },
    name: 'connect.sid' // Explicit session name
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  const sessionMiddleware = getSession();
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Debug middleware to check session - add detailed logging
  app.use('/api/auth', (req: any, res, next) => {
    console.log('🔍 Auth Debug:');
    console.log('  Session ID:', req.sessionID);
    console.log('  Session exists:', !!req.session);
    console.log('  Session passport:', req.session?.passport ? 'exists' : 'none');
    console.log('  req.isAuthenticated():', req.isAuthenticated ? req.isAuthenticated() : 'no method');
    console.log('  Cookies received:', req.headers.cookie || 'none');
    console.log('  User agent:', req.headers['user-agent'] || 'none');
    console.log('  Referer:', req.headers.referer || 'none');
    next();
  });

  let config;
  try {
    config = await getOidcConfig();
    console.log('OAuth config loaded successfully');
  } catch (error) {
    console.error('Failed to load OAuth config:', error);
    throw error;
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      console.log('OAuth verify function called');
      console.log('Token claims:', tokens.claims());
      
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      
      console.log('User created successfully:', user);
      verified(null, user);
    } catch (error) {
      console.error('OAuth verify error:', error);
      verified(error, null);
    }
  };

  // Set up strategies for both localhost and production domains
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  const allDomains = [...domains, "localhost:5000"];
  
  for (const domain of allDomains) {
    const isLocalhost = domain.includes("localhost");
    const protocol = isLocalhost ? "http" : "https";
    const callbackURL = `${protocol}://${domain}/api/callback`;
    
    console.log(`Registering strategy for domain: ${domain}`);
    console.log(`Callback URL: ${callbackURL}`);
    
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`Strategy registered: replitauth:${domain}`);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    console.log('Login request received');
    console.log('Hostname:', req.hostname);
    
    // Use localhost:5000 for local development, actual hostname for production
    const strategyName = req.hostname === 'localhost' ? 'localhost:5000' : req.hostname;
    console.log('Using strategy for login:', strategyName);
    
    try {
      passport.authenticate(`replitauth:${strategyName}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error: any) {
      console.error('Login authentication error:', error);
      res.status(500).json({ message: 'Authentication error', error: error?.message });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    console.log('OAuth callback received');
    console.log('Query params:', req.query);
    console.log('Hostname:', req.hostname);
    console.log('Session ID before callback:', req.sessionID);
    
    // Use localhost:5000 for local development, actual hostname for production
    const strategyName = req.hostname === 'localhost' ? 'localhost:5000' : req.hostname;
    console.log('Using strategy:', strategyName);
    
    passport.authenticate(`replitauth:${strategyName}`, (err: any, user: any, info: any) => {
      console.log('OAuth callback complete');
      console.log('Error:', err);
      console.log('User:', user ? 'exists' : 'null');
      console.log('Info:', info);
      
      if (err) {
        console.error('OAuth callback error:', err);
        return res.redirect('/?error=auth_failed');
      }
      
      if (!user) {
        console.log('No user returned from OAuth');
        console.log('Auth info:', info);
        return res.redirect('/?error=no_user');
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect('/?error=login_failed');
        }
        
        console.log('User successfully logged in');
        console.log('Session ID after login:', req.sessionID);
        console.log('Session passport after login:', (req.session as any).passport ? 'exists' : 'none');
        
        // Force session save before redirect and set explicit cookie
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          }
          console.log('Session saved successfully');
          console.log('Final session ID for redirect:', req.sessionID);
          
          // Log the session for debugging
          console.log('Redirect with session ID:', req.sessionID);
          
          return res.redirect('/dashboard');
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  // Debug logging
  console.log('🔍 Auth check - isAuthenticated:', req.isAuthenticated());
  console.log('🔍 Auth check - user:', user ? 'exists' : 'null');
  console.log('🔍 Auth check - user.expires_at:', user?.expires_at);

  if (!req.isAuthenticated() || !user?.expires_at) {
    console.log('❌ Auth failed - not authenticated or no expires_at');
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};