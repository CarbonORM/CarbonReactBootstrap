import {removeWindowClass} from 'utils/helpers';

export const loginByAuth = async (_email: string, _password: string) => {
  const token = 'I_AM_THE_TOKEN';
  localStorage.setItem('token', token);
  removeWindowClass('login-page');
  removeWindowClass('hold-transition');
  return token;
};

export const registerByAuth = async (_email: string, _password: string) => {
  const token = 'I_AM_THE_TOKEN';
  localStorage.setItem('token', token);
  removeWindowClass('register-page');
  removeWindowClass('hold-transition');
  return token;
};
