import safeEval from 'safe-eval'

export default function saferEval(input: string, context: any = {}): string {
	return safeEval(input.replace('constructor', ''), context)
}
