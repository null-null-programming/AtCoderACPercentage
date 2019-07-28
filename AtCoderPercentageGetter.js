// ==UserScript==
// @name         AtCoderPercentageGetter
// @namespace    https://github.com/null-null-programming
// @version      0.1
// @description  自分と同じくらいのレートの人々の何％がその問題を解けているかを表示する。
// @author       null_null
// @match        https://atcoder.jp/contests/*/standings
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

(async function () {
    //今参加しているコンテスト名
    const contestScreenName = getContestName();

    const contestData = await getContestStandingsData(contestScreenName);

    //コンテスト名のリスト
    const problemNames = [];
    contestData.TaskInfo.forEach(res => problemNames.push(res.TaskScreenName));

    const contestResultData = {};
    contestData.StandingsData.forEach(res => contestResultData[res.UserName] = res);
    console.log(contestResultData);
})();

function getContestName() {
    let contestURL = location.href;
    let contestArray = contestURL.split('/');
    return contestArray[contestArray.length - 2];
}

async function getContestStandingsData(contestScreenName) {
    return await $.ajax(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
}