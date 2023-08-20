export const validSQL: any[] = [];

export function addValidSQL(sql: any) {
    const {expect} = require("@jest/globals");
    validSQL.push({[expect.getState().currentTestName.replaceAll(" ", "_").toLowerCase()]: sql});
}