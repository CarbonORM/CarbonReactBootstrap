import CarbonORM from "CarbonORM";
import {iUsers} from "C6";

export default function () : iUsers | undefined {

    const bootstrap = CarbonORM.instance;

    // @ts-ignore
    return bootstrap.state.users?.find(user => user.ID === bootstrap.state.id)

}