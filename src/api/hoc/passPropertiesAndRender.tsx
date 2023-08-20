import React from "react";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {Location} from "history";
import {NavigateFunction} from "react-router";

export interface WithRouter {
    location: Location;
    navigate: NavigateFunction;
    params: any
}


export default function PassPropertiesAndRender<ComponentProperties = {}>(props: ComponentProperties & {
    element: React.ComponentType<ComponentProperties>
}) {

    const Component = props.element;
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    console.group('ppr', Component.displayName || Component.name);
    console.info({location, navigate, params});
    console.groupEnd();

    return <Component {...props}
                      location={location}
                      navigate={navigate}
                      params={params}>
        <Outlet/>
    </Component>; // never change the order

}
PassPropertiesAndRender.displayName = 'PassPropertiesAndRender';

export function ppr<T = {}, >(Element: React.ComponentType<any>, props: T) {
    return <PassPropertiesAndRender<T> {...props} element={Element}/>;
}
