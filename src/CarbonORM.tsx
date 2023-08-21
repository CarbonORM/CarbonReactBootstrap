import {CarbonReact} from "@carbonorm/carbonreact";
import {iUsers} from "C6";
import {MemoryRouter, HashRouter} from 'react-router-dom';


// This is our ajax class
import {CodeBlock, dracula, googlecode} from 'react-code-blocks';
import isTest from "variables/isTest";

export default class CarbonORM extends CarbonReact<{}, {
    authenticate: string,
    authenticated?: boolean,
    maintenanceMode?: boolean,
    backendThrowable: { [key: string]: any }[],
    pureWordpressPluginConfigured?: boolean,
    documentationVersionURI: string,
    alert?: boolean,
    operationActive: boolean,
    isLoaded: boolean,
    darkMode: boolean,
    alertsWaiting: Array<any>,
    versions: Array<any>,
    users?: Array<iUsers>,
    websocketEvents?: Array<any>,
    websocketData?: Array<any>,
    id?: string
}> {

    static instance: CarbonORM;

    state = {
        carbons: undefined, websocketData: [], websocketEvents: [], websocketMounted: false,
        users: undefined,
        backendThrowable: [],
        maintenanceMode: false,
        authenticate: '/carbon/authenticated',
        documentationVersionURI: '0.0.0',
        authenticated: undefined,
        pureWordpressPluginConfigured: false,
        alert: false,
        operationActive: false,
        isLoaded: false,
        alertsWaiting: [],
        darkMode: true,
        versions: [],
        id: ''
    };

    constructor(props) {
        super(props);
        CarbonORM.instance = this;
    }

    codeBlock = (markdown: string, highlight: string = "", language: string = "php", dark: boolean = true) => {
        return <CodeBlock
            // @ts-ignore
            text={markdown}
            language={language}
            showLineNumbers={true}
            // @ts-ignore
            theme={dark ? dracula : googlecode}
            highlight={highlight}
        />
    };

    render() {
        console.log("LOGIN JSX RENDER");

        const { alert} = this.state;

        const reactRouterContext = (children: any) => {

            if (isTest) {

                return <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>

            }

            return <HashRouter>{children}</HashRouter>

        }

        return reactRouterContext(<>
                {alert}
            {this.props.children}
        </>);

    }
}

