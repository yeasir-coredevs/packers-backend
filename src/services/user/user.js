import passport from 'passport';
import session from 'express-session';
// Internal
import { auth, checkRole } from '../middlewares';
import { getAll, login, logout, me, register, registerStaff, remove, resetpassword, sendOTP, updateOwn, updateUser, userProfile, verifyOTP } from './user.entity';
import passportAuth from './user.passportauth';

export default function user() {

  // express e ja kichu ace shob kichu this er moddhe pabo
  this.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  }));
  this.use((req, res, next) => {
    var msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];
    next();
  });

  // Initialize passport auth
  passportAuth(this.settings);
  this.use(passport.authenticate('session'));

  /**
  * POST /user
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/user', register(this));

  /**
  * POST /staff
  * @description This route is used to create a staff.
  * @response {Object} 200 - the new staff.
  */
  this.route.post('/user/staff', registerStaff(this));

  /**
  * POST /user/login
  * @description this route is used to login a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/login', login(this));

  /**
  * GET /user/me
  * @description this route is used to get user profile.
  * @response {Object} 200 - the user.
  */
  this.route.get('/user/me', auth, me(this));

  /**
  * POST /user/logout
  * @description this route is used to logout a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/logout', auth, logout(this));

  /**
  * GET /user
  * @description this route is used to used get all user.
  * @response {Object} 200 - the users.
  */
  this.route.get('/user', auth, getAll(this));

  /**
  * GET user/profile/:id
  * @description this route is used to get a user profile by id.
  * @response {Object} 200 - the user.
  */
  this.route.get('/user/profile/:id', auth, userProfile(this));

  /**
  * PATCH ‘/user/me’
  * @description this route is used to update own profile.
  * @response {Object} 200 - the user.
  */
  this.route.patch('/user/me', auth, updateOwn(this));

  /**
  * PATCH ‘/user/:id’
  * @description this route is used to update user profile.
  * @response {Object} 200 - the user.
  */
  this.route.patch('/user/:id', auth, checkRole(['admin']), updateUser(this));

  /**
   * DELETE ‘/user/:id’
   * @description this route is used to delte user profile.
   * @response {Object} 200 - the user.
   */
  this.route.delete('/user/:id', auth, checkRole(['admin', 'super-admin']), remove(this));

  /**
   * POST ‘/user/sendotp
   * @description this route is used to send OTP.
   * @response {Object} 200 - the user.
   */
  this.route.post('/user/sendotp', sendOTP(this));

  /**
   * POST ‘/user/verifyotp
   * @description this route is used to verify OTP.
   * @response {Object} 200 - the user.
   */
  this.route.post('/user/verifyotp', verifyOTP());

  /**
 * PATCH ‘/user/resetpassword
 * @description this route is used to reset password.
 * @response {Object} 200 - the user.
 */
  this.route.post('/user/resetpassword', resetpassword(this));

  this.route.get('/login/federated/google', passport.authenticate('google'));

  this.route.get('/google/callback', passport.authenticate('google', {
    session:false,
    successReturnToOrRedirect: '/api/google/success',
    failureRedirect: '/api/google/failure'
  }));

  this.route.get('/google/success', (req, res) => {
    console.log(req.user);
    res.status(200).send(req.user);
  });

  this.route.get('/google/failure', (req, res) => {
    res.status(404).send('Something went wrong');
  });

}