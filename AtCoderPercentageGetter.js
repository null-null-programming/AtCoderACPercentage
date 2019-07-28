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

    //コンテスト情報を辞書型に直す
    const contestResultData = {};
    contestData.StandingsData.forEach(res => contestResultData[res.UserScreenName] = res);

    //参加者自身のusername
    const userScreenName = getUserScreenName();
    //参加者自身のRating
    const userRating = contestResultData[userScreenName].Rating;


})();

//参加しているコンテスト名を取得する。
function getContestName() {
    let contestURL = location.href;
    let contestArray = contestURL.split('/');
    return contestArray[contestArray.length - 2];
}

//コンテストデータを取得する。
async function getContestStandingsData(contestScreenName) {
    return await $.ajax(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
}

//参加者自身のusernameを取得する。
function getUserScreenName() {
    let userScreenName = document.querySelector("#navbar-collapse > ul.nav.navbar-nav.navbar-right > li:nth-child(2) > a").textContent.split(' ');
    return userScreenName[1];
}