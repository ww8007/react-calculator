import {
	MAX_NUMBER_EXPRESSION_LENGTH,
	NUMBERS_AND_OPERATORS,
	OPERATORS_TYPE,
	isOperator
} from "../../../constants";
import { CalculatorReceiver } from "../../commands";

export interface LastOperationType {
	operator: OPERATORS_TYPE | null;
	number: number;
}

export const isValidExpressionAndUnderLimit = (
	currentExpression: string,
	input: string,
	limit: number
): boolean => {
	const isInputIsOperator = isOperator(input);
	// 마지막 문자가 연산자인지 확인
	const isLastCharIsOperator = isOperator(currentExpression.slice(-1));

	if (isInputIsOperator) {
		// 연산자가 연속으로 입력되는 경우를 방지
		return !isLastCharIsOperator;
	} else {
		// 숫자 입력의 경우
		const newExpression = isLastCharIsOperator
			? input
			: currentExpression.concat(input);
		const matches = newExpression.match(/(\d+)$/);
		const newNumber = matches ? Number(matches[0]) : 0;

		// 새로운 숫자가 limit을 초과하는지 확인
		return newNumber < limit;
	}
};

export const parseFourBasicOperationsExpression = (
	expression: string
): string[] => {
	return expression.match(NUMBERS_AND_OPERATORS) || [];
};

export const performCalculation = (
	receiver: CalculatorReceiver,
	parsedExpression: string[]
): string | number => {
	let initialNumberIndex = 0;
	if (isNegativeExpression(parsedExpression)) {
		initialNumberIndex = 1;
		receiver.setInput(parsedExpression[0] + parsedExpression[1]);
	} else {
		receiver.setInput(parsedExpression[0]);
	}

	let operator: OPERATORS_TYPE = "+";
	for (let i = initialNumberIndex + 1; i < parsedExpression.length; i++) {
		const val = parsedExpression[i];
		if (isOperator(val)) {
			operator = val;
		} else {
			receiver.calculate(operator, parseFloat(val));
		}
	}

	const currentValue = receiver.getCurrentValue();
	return isFinite(currentValue) ? currentValue : "오류";
};

const isNegativeExpression = (expression: string[]): boolean => {
	return !isFinite(parseFloat(expression[0])) && expression.length > 1;
};

export const extractLastOperation = (
	parsedExpression: string[]
): LastOperationType => {
	const initialOperation: LastOperationType = { operator: null, number: 0 };

	return parsedExpression.reduce((acc, value) => {
		if (!isNaN(acc.number) && isOperator(value)) {
			return { operator: value, number: acc.number };
		}

		const currentNumber = isNaN(parseFloat(value))
			? acc.number
			: parseFloat(value);
		return { operator: acc.operator, number: currentNumber };
	}, initialOperation);
};

export const isNumberExpression = (expression: string[]): boolean => {
	return expression.length <= MAX_NUMBER_EXPRESSION_LENGTH;
};
