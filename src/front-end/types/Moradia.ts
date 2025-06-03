export default interface Moradia {
    id: number
    nome: string
    descricao: string
    endereco: string
    regras: string[]
    dono: {
        id: number
        nome: string
        email: string
    }
    comodidades: string[]
}