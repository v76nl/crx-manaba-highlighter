// ハイライトしたい単語のリスト
const TARGET_WORDS = [
    "誤っている",
    "誤り",
    "間違っている",
    "間違い",
];

// ハイライト時のスタイル（CSS形式）
const HIGHLIGHT_STYLE = "background-color: #ffff00; color: #000000; font-weight: bold; padding: 2px; border-radius: 3px;";

// ==================================================
// メイン処理
// ==================================================

/**
 * HTML特殊文字をエスケープする
 * テキストをinnerHTMLに入れる際のXSSや表示崩れを防ぐ
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 正規表現で使用される特殊文字をエスケープする
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 指定されたノード以下のテキストを再帰的に走査し、ハイライト処理を行う
 * @param {Node} node - 処理対象のDOMノード
 */
function highlightText(node) {
    // テキストノードの場合
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;

        // 空白のみのノードは無視
        if (!text.trim()) return;

        // ハイライト対象の単語が含まれているかチェック
        // some()を使って、どれか1つでも含まれていれば処理対象とする
        const hasMatch = TARGET_WORDS.some(word => text.includes(word));

        if (hasMatch) {
            // 新しい要素（span）を作成して置換する準備
            const span = document.createElement("span");
            
            // 元のテキストをHTMLエスケープしてから処理開始
            let newHtml = escapeHtml(text);

            // 対象ワードをすべて置換（マークアップ）
            TARGET_WORDS.forEach(word => {
                // 大文字小文字を区別せず検索 (giオプション)
                const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
                
                // マッチした部分をスタイル付きのspanタグで囲む
                newHtml = newHtml.replace(regex, `<span style="${HIGHLIGHT_STYLE}">$1</span>`);
            });

            // HTMLとして設定し、元のテキストノードと入れ替える
            span.innerHTML = newHtml;
            node.parentNode.replaceChild(span, node);
        }
    } 
    // 要素ノードの場合（さらに子要素を探索）
    else if (node.nodeType === Node.ELEMENT_NODE) {
        // スクリプトやスタイル、入力フォームの中身は書き換えないように除外
        const ignoreTags = ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT"];
        if (ignoreTags.includes(node.tagName)) return;

        // 子ノードのリストを配列化してからループ処理
        // (操作中にchildNodesが変化する可能性があるため Array.from を推奨)
        Array.from(node.childNodes).forEach(child => {
            highlightText(child);
        });
    }
}

// ページ読み込み完了後に実行
highlightText(document.body);
