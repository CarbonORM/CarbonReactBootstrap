import classNames from "classnames";
import BootstrapStyles from "index"
import rootStyles from "style.module.scss"

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

const dropStyles = mergeStyles(BootstrapStyles, rootStyles);

type tBootstrap = typeof BootstrapStyles

type tRootStyles = typeof rootStyles

export default function getStyles<iCSS extends {}>(overrides: iCSS = {} as iCSS): tBootstrap & tRootStyles & iCSS {

    if (0 === Object.keys(overrides).length) {
        return dropStyles as (typeof dropStyles) & iCSS
    }

    return mergeStyles(dropStyles, overrides)

}