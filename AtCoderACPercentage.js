// ==UserScript==
// @name         AtCoderACPercentage
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
    //参加者自身のRating
    const userRating = getUserRating(userScreenName);
    //コンテスト情報
    const contestData = await getContestStandingsData(contestScreenName);

    //コンテスト名のリスト
    const problemNames = [];
    contestData.TaskInfo.forEach(res => problemNames.push(res.TaskScreenName));
    //問題名の記号（AとかBとか）配列 <-これを作っておかないとF1 F2 などが来たときにバグる
    const Assignment = [''];
    contestData.TaskInfo.forEach(res => Assignment.push(res.Assignment));


    //コンテスト情報を辞書型に直す userScreenName->Data
    const contestResultData = {};
    //参加回数が１5回以上のコンテスト参加者のuserScreenNameリスト
    let contestUserName = [];

    contestData.StandingsData.forEach(res => {
        //辞書型に変換
        contestResultData[res.UserScreenName] = res

        //コンテスト参加回数１５回未満、自分自身、未提出者は除いてリストに入れる
        if (res.Competitions >= 15 && res.userName !== userScreenName && res.TotalResult.Count > 0) contestUserName.push(res.UserScreenName);
    });

    //TODO:評価関数の洗練
    //自身のレートとの絶対値の差が小さい順に並び替え。
    contestUserName.sort(function (x, y) {
        return Math.abs(userRating - contestResultData[x].Rating) - Math.abs(userRating - contestResultData[y].Rating);
    });

    //TODO:選抜者人数の見直し
    //選抜者人数の１０パーセントを選抜者人数とする。
    const USER_NAM = contestUserName.length * 0.1;

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
        return Math.round(sum * 10 * 100 / USER_NAM) / 10;
    });

    //結果を表示するテーブルを作成する。

    //行を追加
    let table = document.querySelector("#main-container > div.row > div:nth-child(3) > div.panel.panel-default.panel-standings > div.table-responsive > table");
    let row = table.insertRow(-1);

    //列を追加
    let cells = [];

    for (let i = 0; i < problemNames.length + 1; i++) {
        cells[i] = row.insertCell(i);

        if (i === 0) {
            //行の左端  題名を書き込む
            cells[i].innerText = 'AC Percentage';
            cells[i].colSpan = "3";
        } else {
            //問題欄  計算結果と問題名アルファベットを書き込む
            cells[i].innerText = Assignment[i] + ':' + solvedPercentage[i - 1] + '%';
        }
    }


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

async function getUserRating(userScreenName) {
    let parser = new DOMParser();
    let archiveDom = parser.parseFromString((await $.get('https://atcoder.jp/users/' + userScreenName)), "text/html");
    let userRating = archiveDom.querySelector("#main-container > div.row > div.col-sm-9 > table > tbody > tr:nth-child(2) > td > span");
    return Number(userRating.innerText);
}