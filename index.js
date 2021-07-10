const PLACEHOLDER = `
import discord


client = discord.Client()

@bot.event
async def on_ready():
  print(f"Logged in as {client.user}")

bot.run("Th1sIsN0t4T0k3n.B3cause.1fiSh0w1tB0tWillG3tH4cked")
`.trim()
const RESULT_PLACEHOLDER = `
discord.pyが動かない原因をコードから推測するWebツールです。

上のテキストボックスにコードを入力すると推測されます。

コントリビューション大歓迎！
https://github.com/sevenc-nanashi/dpy-error-suggester
`.trim()
const ERRORS = [
    [/client=commands\.Bot/g, "commands.Botはbotという名前の変数に入れる事が推奨されています。"],
    [/@(client|bot)\.event\ndef (.+):/g, "@$1.eventに登録する関数は非同期（async def）である必要があります。"],
    [/@(client|bot)\.event\n(?:async )?def (?!on_)(.+):/g, "@$1.eventに登録する関数はon_から始まる必要があります。"],
    [/@(?:client|bot)\.event\nasync def on_(.+):[\s\S]+@(?:client|bot)\.event\nasync def on_\1/g, "イベント$1が重複しています。最後のon_$1だけが実行されます。"],


]
class ResultError {
    constructor(message, lineno) {
        this.message = message
        this.lineno = lineno
    }

    get format() {
        return `${this.lineno} : ${this.message}`
    }
}

function expandMatch(match, baseString) {
    Array.from(match).forEach((string, index) => { baseString = baseString.replaceAll("$" + index, string) })
    return baseString
}
function detectCode() {
    content = document.getElementById("main-code-textarea").value.replaceAll(/ *([,=]) */g, "$1").replaceAll(/^ +/g, "")
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
            lineIndex = bc.match(/\n/g).length
            if (lineIndex == null) {
                lineIndex = 0
            }
            line = lines[lineIndex]
            results.push(new ResultError(expandMatch(match, message), line))
        }
    }
    document.getElementById("result-code-textarea").value = results.sort((a, b) => (a.lineno - b.lineno).sign).map(result => result.format).join("\n")
}

document.getElementById("main-code-textarea").setAttribute("placeholder", PLACEHOLDER)
document.getElementById("main-code-textarea").addEventListener("change", detectCode)
document.getElementById("result-code-textarea").setAttribute("placeholder", RESULT_PLACEHOLDER)