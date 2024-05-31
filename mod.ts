// deno-lint-ignore-file prefer-const
import { readAll } from "https://deno.land/std@0.224.0/io/read_all.ts";
import { optimize } from "npm:svgo"


export function createUUID(n=7){
    let arr = new Array<number>(n)
    let newArr = arr.fill(0).map(_=>Math.floor(Math.random()*36))
    let r = newArr.map(a=>a.toString(36)).join("")
    return r
}

function renderReactSvg(svg:string){
    let result1 = optimize(svg,{
        
    })
    let result = optimize(result1.data,{
        multipass: true,
        js2svg:{
            indent: 4,
            pretty: true
        },
        plugins: [{
            name: 'prefixIds',
            params: {
                delim: '',
                prefix: () => createUUID(3),
            }
        } as any]
    })
    let outputStr = result.data
    let lines = outputStr.replaceAll(/\b[a-z0-9]+([-:][a-z0-9]+)+=/g,(a:any)=>{
        let xs = a.split(/[-:]/) 
        let [head,...rest] = xs
        return head + rest.map((word:string)=>{
            return word.slice(0,1).toUpperCase() + word.slice(1)
        }).join("")
    }).split("\n")
    let [head,...rest] = lines
    let w = /width="([0-9]+)/.exec(head )?.[1] || ""
    let h= /height="([0-9]+)/.exec(head )?.[1] || ""
    let out = `<svg viewBox="0 0 ${w} ${h}" {...props}>\n` + rest.map(line=>"    "+line).join("\n")
    return `import { SVGProps } from "react"
export function DiqyeSvg(props: SVGProps<SVGSVGElement>) {
    return ${out}
}
`
}
async function readTextAll(){
    let data = await readAll(Deno.stdin)
    return new TextDecoder().decode(data)
}
async function main(){
    let text = await readTextAll()    
    let outText = renderReactSvg(text)
    console.log(outText)
}
main()