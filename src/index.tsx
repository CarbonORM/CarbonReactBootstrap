import React from 'react';
import CarbonORM from "CarbonORM";
import ReactDOM from 'react-dom/client';

import BootstrapStyles from 'variables/bootstrap.module.scss';
import "bootstrap/dist/js/bootstrap.js";

import App from './App';
import reportWebVitals from './reportWebVitals';
import {Provider} from 'react-redux';
import store from 'store/store';

import './utils/i18n';
// import * as serviceWorker from './serviceWorker';

export default BootstrapStyles;

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <CarbonORM>
            <Provider store={store}>
                <App/>
            </Provider>
        </CarbonORM>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register({});
