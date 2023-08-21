import postUsers from "api/rest/postUsers";
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {toast} from 'react-toastify';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import * as Yup from 'yup';
// import {loginUser} from '@store/reducers/auth';
import {setWindowClass} from 'utils/helpers';
import {Form, InputGroup} from 'react-bootstrap';
import {PfButton, PfCheckbox} from '@profabric/react-components';

import {
    GoogleProvider,
    //authLogin,
    facebookLogin,
} from 'utils/oidc-providers';
import {setAuthentication} from 'store/reducers/auth';

const Register = () => {
    const [isAuthLoading, setAuthLoading] = useState(false);
    const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
    const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);
    const [t] = useTranslation();
    const dispatch = useDispatch();

    const navigate = useNavigate();

    interface IRegisterForm {
        username: string;
        email: string;
        password: string;
    }

    const register = async (values : IRegisterForm) => {

        try {

            setAuthLoading(true);

            const response = await postUsers({
                user_username: values.username,
                user_email: values.email,
                user_password: values.password
            });

            console.log(response);

            // this is just bs template filler
            //const response = await authLogin(values.email, values.password);

            dispatch(setAuthentication({ profile: { email: 'admin@example.com' } } as any));

            toast.success('Registration is success');

            navigate('/');

        } catch (error: any) {

            toast.error(error.message || 'Failed');

            setAuthLoading(false);

        }

    };

    const registerByGoogle = async () => {
        try {
            setGoogleAuthLoading(true);
            const response = await GoogleProvider.signinPopup();
            dispatch(setAuthentication(response as any));
            setGoogleAuthLoading(false);
            toast.success('Authentication is succeed!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed');
            setGoogleAuthLoading(false);
        }
    };

    const registerByFacebook = async () => {
        try {
            setFacebookAuthLoading(true);
            const response = await facebookLogin();
            dispatch(setAuthentication(response as any));
            setFacebookAuthLoading(false);
            navigate('/');
        } catch (error: any) {
            setFacebookAuthLoading(false);
            toast.error(error.message || 'Failed');
        }
    };

    const {
        handleChange,
        values,
        handleSubmit,
        touched,
        errors
    } = useFormik(
        {
            initialValues: {
                username: '',
                email: '',
                password: '',
                passwordRetype: ''
            },
            validationSchema: Yup.object({
                username: Yup.string()
                    .min(8, 'Must be at least 8 characters')
                    .max(20, 'Must be less  than 20 characters')
                    .required('Username is required')
                    .test('Unique Username', 'Username already in use', // <- key, message
                        function (_value) {
                            return new Promise((resolve, _reject) => {
                                /*axios.get(`http://localhost:8003/api/u/user/${value}/available`)
                                    .then((res) => {
                                      resolve(true)
                                    })
                                    .catch((error) => {
                                      if (error.response.data.content === "The email has already been taken.") {
                                        resolve(false);
                                      }
                                    })*/

                                resolve(true)

                            })
                        }
                    ),
                email: Yup.string().email('Invalid email address!'),
                password: Yup.string()
                    .min(5, 'Must be 5 characters or more')
                    .max(30, 'Must be 30 characters or less')
                    .required('Required'),
                passwordRetype: Yup.string()
                    .min(5, 'Must be 5 characters or more')
                    .max(30, 'Must be 30 characters or less')
                    .required('Required'),
            }),
            onSubmit: (values) => {
                register(values);
            }
        })

    setWindowClass('hold-transition register-page');

    return (
        <div className="register-box">
            <div className="card card-outline card-primary">
                <div className="card-header text-center">
                    <Link to="/" className="h1">
                        <b>React</b>
                        <span>Boot</span>
                    </Link>
                </div>
                <div className="card-body">
                    <p className="login-box-msg">{t<string>('register.registerNew')}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <InputGroup className="mb-3">
                                <Form.Control
                                    id="username"
                                    name="username"
                                    type="username"
                                    placeholder="Username"
                                    onChange={handleChange}
                                    value={values.username}
                                    isValid={touched.username && !errors.username}
                                    isInvalid={touched.username && !!errors.username}
                                />
                                {touched.username && errors.username ? (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                ) : (
                                    <InputGroup.Append>
                                        <InputGroup.Text>
                                            <i className="fas fa-user"/>
                                        </InputGroup.Text>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                        </div>
                        <div className="mb-3">
                            <InputGroup className="mb-3">
                                <Form.Control
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email (optional)"
                                    onChange={handleChange}
                                    value={values.email}
                                    isValid={touched.email && !errors.email}
                                    isInvalid={touched.email && !!errors.email}
                                />
                                {touched.email && errors.email ? (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                ) : (
                                    <InputGroup.Append>
                                        <InputGroup.Text>
                                            <i className="fas fa-envelope"/>
                                        </InputGroup.Text>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                        </div>
                        <div className="mb-3">
                            <InputGroup className="mb-3">
                                <Form.Control
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    onChange={handleChange}
                                    value={values.password}
                                    isValid={touched.password && !errors.password}
                                    isInvalid={touched.password && !!errors.password}
                                />
                                {touched.password && errors.password ? (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                ) : (
                                    <InputGroup.Append>
                                        <InputGroup.Text>
                                            <i className="fas fa-lock"/>
                                        </InputGroup.Text>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                        </div>

                        <div className="mb-3">
                            <InputGroup className="mb-3">
                                <Form.Control
                                    id="passwordRetype"
                                    name="passwordRetype"
                                    type="password"
                                    placeholder="Retype password"
                                    onChange={handleChange}
                                    value={values.passwordRetype}
                                    isValid={touched.passwordRetype && !errors.passwordRetype}
                                    isInvalid={touched.passwordRetype && !!errors.passwordRetype}
                                />

                                {touched.passwordRetype && errors.passwordRetype ? (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.passwordRetype}
                                    </Form.Control.Feedback>
                                ) : (
                                    <InputGroup.Append>
                                        <InputGroup.Text>
                                            <i className="fas fa-lock"/>
                                        </InputGroup.Text>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                        </div>

                        <div className="row">
                            <div className="col-7">
                                <PfCheckbox checked={false}>
                                    <span>I agree to the </span>
                                    <Link to="/">terms</Link>
                                </PfCheckbox>
                            </div>
                            <div className="col-5">
                                <PfButton
                                    type="submit"
                                    block
                                    loading={isAuthLoading}
                                    disabled={isGoogleAuthLoading || isFacebookAuthLoading}
                                >
                                    {t<string>('register.label')}
                                </PfButton>
                            </div>
                        </div>
                    </form>
                    <div className="social-auth-links text-center">
                        <PfButton
                            block
                            className="mb-2"
                            onClick={registerByFacebook}
                            loading={isFacebookAuthLoading}
                            disabled={isAuthLoading || isGoogleAuthLoading}
                        >
                            <i className="fab fa-facebook mr-2"/>
                            {t<string>('login.button.signIn.social', {
                                what: 'Facebook',
                            })}
                        </PfButton>
                        <PfButton
                            block
                            theme="danger"
                            onClick={registerByGoogle}
                            loading={isGoogleAuthLoading}
                            disabled={isAuthLoading || isFacebookAuthLoading}
                        >
                            <i className="fab fa-google mr-2"/>
                            {t<string>('login.button.signUp.social', {what: 'Google'})}
                        </PfButton>
                    </div>
                    <Link to="/login" className="text-center">
                        {t<string>('register.alreadyHave')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
