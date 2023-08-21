import RootStyles from "bootstrap.module.css";
import classNames from "classnames";


export const getRootStyleValue = (property = '--dig_primary_color') : string => {

    return getComputedStyle(document.documentElement)
        .getPropertyValue(property).trim();

}

interface iStyle {
    [x: string]: any
}

function mergeStyles<iStyleA extends iStyle, iStyleB extends iStyle>(styleA : iStyleA, styleB: iStyleB) : iStyleA & iStyleB {

    let styles : iStyle = {};

    const mergedClassNames = Object.keys(styleA).concat(Object.keys(styleB))

    mergedClassNames.map(className => {
        styles[className] = classNames(styleA[className], styleB[className])
    })

    return styles as (iStyleA & iStyleB)

}

type tBootstrap = typeof RootStyles

export default function getStyles<iCSS extends {}>(overrides: iCSS = {} as iCSS): tBootstrap & iCSS {

    if (0 === Object.keys(overrides).length) {
        return RootStyles as (typeof RootStyles) & iCSS
    }

    return mergeStyles(RootStyles, overrides)

}