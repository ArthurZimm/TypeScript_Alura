import { GrupoTransacao } from "./GrupoTransacao.js";
import { TipoTransacao } from "./TipoTransacao.js";
import { Transacao } from "./Transacao.js";

let saldo:number = JSON.parse(localStorage.getItem("saldo")) || 0;
const transacoes: Transacao[] = JSON.parse(localStorage.getItem("transacoes"), (key :string,value:string)=>{
    if(key == "data"){
        return new Date(value);
    }

    return value;
}) || [];

function debitar(valor:number) :void{
    if(valor <= 0){
        throw new Error("Valor a ser debitado deve ser maior que 0!");
    }
    if (saldo < valor) {
        throw new Error("Saldo insuficiente!");
    }
    saldo -= valor;
    localStorage.setItem("saldo", saldo.toString());
}
function depositar(valor:number) :void{
    if(valor <= 0){
        throw new Error("Valor a ser depositado deve ser maior que 0!");
    }
    saldo += valor;
    localStorage.setItem("saldo", saldo.toString());
}

const Conta = {
    getSaldo(){
        return saldo;
    },

    getDataAcesso() :Date{
        return new Date();
    },

    getGruposTransacoes() : GrupoTransacao[]{
        const gruposTransacoes: GrupoTransacao[] = [];
        const listaTransacoes: Transacao[] = structuredClone(transacoes);
        const transacoesOrdenadas:Transacao[] = listaTransacoes.sort((a,b)=> b.data.getTime() - a.data.getTime());
        let labelAtualGrupoTransacao:string = "";

        for(let transacao of transacoesOrdenadas){
            let labelGrupoTransacao:string = transacao.data.toLocaleDateString("pt-br", {month:"long", year:"numeric"});
            if(labelAtualGrupoTransacao != labelGrupoTransacao){
                labelAtualGrupoTransacao = labelGrupoTransacao;
                gruposTransacoes.push({
                    label: labelGrupoTransacao,
                    transacoes: []
                });
            }
            gruposTransacoes.at(-1).transacoes.push(transacao);
        }

        return gruposTransacoes;
    },

    registrarTransacao(novaTransacao:Transacao) :void{
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            depositar(novaTransacao.valor);
        } 
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao == TipoTransacao.BOLETO) {
            debitar(novaTransacao.valor);
            novaTransacao.valor *= -1;
        } 
        else {
            throw new Error("Tipo de Transação é inválido!");
        }
        transacoes.push(novaTransacao);
        console.log(this.getGruposTransacoes());
        localStorage.setItem("transacoes", JSON.stringify(transacoes));
    }
}

export default Conta;