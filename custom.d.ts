declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

declare module '@superfaceai/passport-twitter-oauth2';
declare module '*.json' {
  const value: any;
  export default value;
}
