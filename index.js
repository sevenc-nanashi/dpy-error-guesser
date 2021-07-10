let language = window.navigator.userLanguage || window.navigator.language;
if (language == "ja") {

    PLACEHOLDER = `
import discord


client = discord.Client()

@bot.event
async def on_ready():
  print(f"Logged in as {client.user}")

bot.run("Th1sIsN0t4T0k3n.B3cause.1fiSh0w1tB0tWillG3tH4cked")
`.trim()
    RESULT_PLACEHOLDER = `
discord.pyが動かない原因をコードから推測するWebツールです。

上のテキストボックスにコードを入力すると推測されます。

コントリビューション大歓迎！
https://github.com/sevenc-nanashi/dpy-error-guesser
`.trim()
    ERRORS = [
        [/client=commands\.Bot/g, "?commands.Botはbotという名前の変数に入れることが一般的です。"],
        [/@([a-z_A-Z]+)\.event\ndef (.+):/g, "@$1.eventに登録する関数は非同期（async def）である必要があります。"],
        [/@([a-z_A-Z]+)\.event\n(?:async )?def (?!on_)[a-z_]+\(.*\):/g, "@$1.eventに登録する関数はon_から始まる必要があります。"],
        [/@(?:[a-z_A-Z]+)\.event\nasync def on_([a-z_]+)\(.*\):[\s\S]+@(?:[a-z_A-Z]+)\.event\nasync def on_\1\(.*\)/g, "イベント on_$1が重複しています。最後のon_$1だけが実行されます。"],
    ]
    couldNotFind = "問題を検出できませんでした。"
} else {
    PLACEHOLDER = `
import discord


client = discord.Client()

@bot.event
async def on_ready():
  print(f"Logged in as {client.user}")

bot.run("Th1sIsN0t4T0k3n.B3cause.1fiSh0w1tB0tWillG3tH4cked")
`.trim()
    RESULT_PLACEHOLDER = `
A web tool that guesses the wrong code from source code.

Input textarea above to guess error.

We welcome contributions!
https://github.com/sevenc-nanashi/dpy-error-guesser
`.trim()
    ERRORS = [
        [/client=commands\.Bot/g, "commands.Bot is usually placed in a variable named bot."],
        [/@([a-z_A-Z]+)\.event\ndef (.+):/g, "Function for @$1.event should be async function (async def)."],
        [/@([a-z_A-Z]+)\.event\n(?:async )?def (?!on_)[a-z_]+\(.*\):/g, "Name of function for @$1.event should be started with \"on_\"."],
        [/@(?:[a-z_A-Z]+)\.event\nasync def on_([a-z_]+)\(.*\):[\s\S]+@(?:[a-z_A-Z]+)\.event\nasync def on_\1\(.*\)/g, "There're multiple event listener for on_$1, Last on_$1 will be called."],
    ]
    couldNotFind = "We couldn't find any problem."

    replaces = {
        "#input-container h2": "Input",
        "label[for='main-code-textarea']": "Source code",
        "#result-container h2": "Result",
        "label[for='result-code-textarea']": "Source code"
    }
    for ([selector, text] of Object.entries(replaces)) {
        document.querySelector(selector).innerText = text
    }
}

class ResultError {
    constructor(message, lineno) {
        this.message = message
        this.lineno = lineno
    }

    get format() {
        if (this.message.startsWith("?")) {
            return `（${this.lineno} : ${this.message.substr(1)}）`
        } else {
            return `${this.lineno} : ${this.message}`
        }
    }
}

function expandMatch(match, baseString) {
    Array.from(match).forEach((string, index) => { baseString = baseString.replaceAll("$" + index, string) })
    return baseString
}
function detectCode() {
    content = document.getElementById("main-code-textarea").value.replaceAll(/ *([,=]) */g, "$1").replaceAll(/^ +/g, "").replaceAll(/#.*/g, "")
    if (content.length == 0) {
        document.getElementById("result-code-textarea").value = ""
        return
    }
    code = ""
    inQuote = null
    bracketCounter = 0
    lineCounter = 1
    lines = [1]
    for (c of content.split("")) {
        if (c == "\n") {
            lineCounter++
        }
        if (inQuote) {
            if ("\"'".includes(c)) {
                inQuote = null
            }
        } else {
            if ("\"'".includes(c)) {
                inQuote = c
                continue
            } else if ("({[".includes(c)) {
                bracketCounter++
            } else if ("]})".includes(c)) {
                bracketCounter--
            } else if ("\n" == c) {
                if (bracketCounter == 0) {
                    code += "\n"
                    lines.push(lineCounter)
                }
                continue
            }
            code += c
        }
    }
    results = []
    eventCounter = {}

    for ([regex, message] of ERRORS) {
        for (match of code.matchAll(regex)) {
            bc = code.substr(0, match.index)
            lineIndex = bc.match(/\n/g) == null ? 0 : bc.match(/\n/g).length
            if (lineIndex == null) {
                lineIndex = 0
            }
            line = lines[lineIndex]
            results.push(new ResultError(expandMatch(match, message), line))
        }
    }
    if (results.length > 0) {
        document.getElementById("result-code-textarea").value = results.sort((a, b) => (a.lineno - b.lineno).sign).map(result => result.format).join("\n")
    } else {
        document.getElementById("result-code-textarea").value = couldNotFind
    }
}

document.getElementById("main-code-textarea").setAttribute("placeholder", PLACEHOLDER)
document.getElementById("main-code-textarea").addEventListener("change", detectCode)
document.getElementById("result-code-textarea").setAttribute("placeholder", RESULT_PLACEHOLDER)