import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

const passportConfig = function (passport) {
  const localStrategy = new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) return done(null, false, { message: "User not found" });
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return done(null, false, { message: "Incorrect username or password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  const JwtStrategy = new JWTStrategy(
    { secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.userId);
        if (!user) return done(null, false, { message: "Not authorized" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  );

  passport.use(localStrategy);
  passport.use(JwtStrategy);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await User.findById(userId);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
};

export default passportConfig;
