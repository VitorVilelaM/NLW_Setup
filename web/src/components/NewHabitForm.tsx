import { Check } from "phosphor-react";

export function NewHabitForm() {
    return (
        <form className="w-full flex flex-col mt-6">
            <label htmlFor="title" className="font-semibold leading-tight">Qual o seu compromentimento?</label>
            <input type="text" id="name" placeholder="ex.: Exercícios, dormir bem, etc..." autoFocus className="p-4 rounded-lg mt-3 bg-zinc-800 text-white hover:bg-zinc-400"/>
            <label htmlFor="" className="font-semibold leading-tight mt-4">Qual a recorrência?</label>

            <button type="submit" className="mt-6 rounded-lg p-4 gap-3 flex items-center font-semibold bg-green-600 justify-center hover:bg-green-500">
                <Check size={20} weight="bold"></Check>
                Confirmar
            </button>

        </form>

    )
}