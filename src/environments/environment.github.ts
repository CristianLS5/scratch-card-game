declare const process: any;

export const environment = {
  production: true,
  auth: {
    username: process.env['NG_APP_USERNAME'],
    password: process.env['NG_APP_PASSWORD'],
  },
  winningCode: process.env['NG_APP_WINNING_CODE']
}; 