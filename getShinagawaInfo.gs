// 定数。constは使えないらしい。
var KAITEN_HEITEN_URL = 'https://kaiten-heiten.com/feed/';
// gitに登録するにあたってマスク
var SLACK_CH_50_URL = '*******';

// 「開店閉店.com」を「品川区」で検索・整形し、
// slackの「生活の会」-「50_ユーティリティ」にポストする.
// タイマー実行したときに、実行時情報が引数として渡されるようだが必要ないので無視する.
function postShinagawaInfoToSlack(){
  // 「品川」だと品川駅周辺のいらない情報も入ってくるらしいので「品川区」とした.
  var keyword = '品川区';
  var url = KAITEN_HEITEN_URL;
  
  var targets = getTitleAndLinkInItem(url, keyword);
  
  var sendText = "";
  // 必要な情報が得られなかったら何もしないで終了する.
  if(targets.length === 0){
    return;
  }else{
    for each(var target in targets){
      sendText = makeMessage(target.title, target.link);
    }
  }

  sendMessage(SLACK_CH_50_URL,text);
}

// 指定されたurlを指定されたkeywordで検索.
// 条件に当てはまる全てのitemのtitleとlinkを1つの文字列にして返す(改行コード\nを含む).
// itemの中にtitleとlinkがあることが前提になっている.
function getTitleAndLinkInItem(url, keyword){
  // 指定されたurlのコンテンツ(xml)を取得する.
  var xml = UrlFetchApp.fetch(url).getContentText('UTF-8');
  
  // コンテンツからitemを抽出しitemsに格納.
  var items = getElements(xml, 'item');
  var targets = [];
  
  for each(var item in items) {
    // 探している文字が含まれているか？ いなければ次のitemへ.
    if (item.indexOf(keyword) === -1) {
      continue;
    }
    // 探している文字が含まれていた場合、titleとlinkを取得する.
    var title = getElements(item, 'title');
    var link = getElements(item, 'link');
    // titleとinfoをオブジェクトにまとめて、targetsに格納.
    var info = {
      title: title,
      link: link
    };
    targets.push(info);
  }
  
  return targets;
}

// "title(link)\n"という形式の文字列を引数から作成する.
function makeMessage(title, link){
  var message = title + "(" + link + ")\n";
  return message;
}

// targetから指定されたタグに囲まれた要素を取得する.
function getElements(target, tag){
  var data = Parser.data(target).from('<' + tag + '>').to('</' + tag + '>').iterate();
  return data;
}

// 指定されたurlにmessageをポストする
function sendMessage(url, message){
  var options = {
    "method": "POST",
    "payload": '{"text":"' + message + '"}'
  };
  UrlFetchApp.fetch(url, options);
}
