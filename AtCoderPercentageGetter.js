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
    //参加者自身のusername
    const userScreenName = getUserScreenName();
    //コンテスト情報
    const contestData = await getContestStandingsData(contestScreenName);

    //コンテスト名のリスト
    const problemNames = [];
    contestData.TaskInfo.forEach(res => problemNames.push(res.TaskScreenName));

    //コンテスト情報を辞書型に直す userScreenName->Data
    const contestResultData = {};
    //参加回数が１5回以上のコンテスト参加者のuserScreenNameリスト
    let contestUserName = [];

    contestData.StandingsData.forEach(res => {
        contestResultData[res.UserScreenName] = res
        //自分自身は除く
        if (res.Competitions >= 15 && res.userName !== userScreenName) contestUserName.push(res.UserScreenName);
    });

    //参加者自身のRating
    const userRating = contestResultData[userScreenName].Rating;

    //TODO:評価関数の洗練
    //自身のレートとの絶対値の差が小さい順に並び替え。
    contestUserName.sort(function (x, y) {
        return Math.abs(userRating - contestResultData[x].Rating) - Math.abs(userRating - contestResultData[y].Rating);
    });

    //選抜者人数
    const USER_NAM = Math.min(300, contestUserName.length);
    //パーセントに直すときに割る定数
    const DIV = USER_NAM / 100;

    //TODO:選抜者人数の見直し
    //自身のレートに近いUSER_NAM人の参加者を選抜
    contestUserName = contestUserName.slice(0, USER_NAM);

    //何人が解けたかを問題ごとに集計
    let solvedPercentage = problemNames.map(problemName => {
        let sum = 0;

        //各ユーザーごとに集計
        contestUserName.forEach(userName => {
            if (contestResultData[userName].TaskResults[problemName]) {
                if (contestResultData[userName].TaskResults[problemName].Score > 0) sum++;
            }
        });

        //小数第１位までパーセントを表示
        return Math.round(sum * 10 / DIV) / 10;
    });

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