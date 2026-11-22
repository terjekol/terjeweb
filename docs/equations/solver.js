/* Restored from lab.kolderup.net and FunkyTerje. See DEPLOYMENT.md for provenance. */

function indexesFromNode(node) {
  if (!node.parent) return "";
  const lastChoice = node.parent.content[0] === node ? "0" : "1";
  return indexesFromNode(node.parent) + lastChoice;
}
function nodeFromIndexes(indexes, tree) {
  let node = tree;
  for (let index of indexes) {
    node = node.content[index];
  }
  return node;
}
function isLetter(node) {
  return (
    node.value &&
    node.value.length === 1 &&
    node.value >= "a" &&
    node.value <= "z"
  );
}
function isNumber(node) {
  return (
    typeof node.value === "string" &&
    node.value.length > 0 &&
    node.value.split("").filter((c) => c < "0" || c > "9").length === 0
  );
}
function isUnaryMinus(node) {
  return node.operator === "-" && node.content.length === 1;
}
function isMultiplication(node) {
  return node.operator === "*";
}
function isDivision(node) {
  return node.operator === "/";
}
function isTopLevelTerm(node) {
  if ("=+-".includes(node.operator) && node.content.length === 2) return false;
  return (
    firstParentOperatorOtherThan("+-", node) === "=" &&
    !isUnaryMinus(node.parent)
  );
}
function firstParentOperatorOtherThan(operators, node) {
  return operators.includes(node.parent.operator)
    ? firstParentOperatorOtherThan(operators, node.parent)
    : node.parent.operator;
}
function parentOperator(node) {
  return node.parent ? node.parent.operator : null;
}
function range(min, max) {
  const count = max - min;
  return Array.from(Array(count).keys()).map((n) => n + min);
}
const levelExerciseFunctions = [
  () => createEquation([randomTerm(true, false)]),
  () => createEquation([randomTerm(true, false), randomTerm(false, false)]),
  () => createEquation([randomTerm(false, false)], [randomTerm(true, false)]),
  createEquationWithXTermsWithDiffOfOne,
  createEquationWithXTermsWithDiffOfOne,
  createEquationWithNoNeedForPrimeFactorization,
  createEquationWithNeedForPrimeFactorization,
];
function createEquationWithNeedForPrimeFactorization() {
  const commonFactorCount = 1;
  const commonFactors = range(0, commonFactorCount).map(() => randomPrime());
  const product = commonFactors.reduce((value, total) => total * value, 1);
  const a = product * randomPrime();
  const b = product * randomFromArray([2, 3, 5, 7].filter((n) => n !== a));
  const [a1, a2] = splitNumberInTwoRandomParts(a);
  const [b1, b2] = splitNumberInTwoRandomParts(b);
  return equationAxBequalsCxD(a1, -b1, -a2, b2);
}
function createEquationWithNoNeedForPrimeFactorization() {
  const a = randomPrime();
  const b = randomFromArray([2, 3, 5, 7].filter((n) => n !== a));
  const [a1, a2] = splitNumberInTwoRandomParts(a);
  const [b1, b2] = splitNumberInTwoRandomParts(b);
  return equationAxBequalsCxD(a1, -b1, -a2, b2);
}
function equationAxBequalsCxD(a, b, c, d) {
  return randomOrderSum(a, b) + "=" + randomOrderSum(c, d);
}
function splitNumberInTwoRandomParts(n) {
  const term = numberWithRandomSign(randomNumber());
  return [term, n - term];
}
function createEquationWithXTermsWithDiffOfOne() {
  const x1abs = randomNumberFromRange(2, 8);
  const x2abs = x1abs + 1;
  const x1 = randomBool() ? x1abs : -1 * x1abs;
  const x2 = x1 > 0 ? x2abs : -1 * x2abs;
  const c1abs = randomNumber();
  const c2abs = randomNumber();
  const c1 = randomBool() ? c1abs : -1 * c1abs;
  const c2 = c1 > 0 ? c2abs : -1 * c2abs;
  return equationAxBequalsCxD(x1, c1, x2, c2);
}
function numberWithRandomSign(number) {
  return randomBool() ? number : -1 * number;
}
function randomOrderSum(x, c) {
  const xTxt = x >= 0 ? "+" + x : "" + x;
  const cTxt = c >= 0 ? "+" + c : "" + c;
  const sum = randomBool() ? xTxt + "*x" + cTxt : cTxt + xTxt + "*x";
  return sum.startsWith("+") ? sum.slice(1) : sum;
}
function randomBool() {
  return Math.random() < 0.5;
}
function createEquation(terms1, terms2) {
  if (!terms2) return randomFlipOrNot("x=" + terms1.join(""));
  return randomFlipOrNot("x" + terms1.join("") + "=" + terms2.join(""));
}
function randomTerm(isFirst, includeX) {
  let txt = "";
  txt += randomSign(isFirst ? "" : null);
  txt += randomNumber();
  return includeX ? txt + "*x" : txt;
}
function randomNumberFromRange(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}
function randomNumber() {
  return randomNumberFromRange(1, 9);
}
function randomPrime() {
  return randomFromArray([2, 3, 5, 7]);
}
function randomFromArray(array) {
  return array[randomNumberFromRange(0, array.length)];
}
function randomFlipOrNot(equation) {
  if (Math.random() < 0.5) return equation;
  const parts = equation.split("=");
  return parts[1] + "=" + parts[0];
}
function randomSign(plusSign) {
  return Math.random() < 0.5 ? "-" : plusSign === null ? "+" : plusSign;
}
function parseMathText(mathText) {
  const sides = mathText.split("=");
  if (sides.length === 1) return parse(lex(sides[0]));
  if (sides.length !== 2) throw new SyntaxError("Forventet ett likhetstegn.");
  return addParentAndId(
    makeNode(
      "=",
      sides.map((side) => parse(lex(side))),
    ),
    null,
  );
}

function needsParentheses(node, parent, isRight) {
  const operator = node.operator;
  if (!operator) return false;
  if (parent === "-") return isRight && ["+", "-"].includes(operator);
  if (parent === "*")
    return (
      ["+", "/"].includes(operator) ||
      (operator === "-" && node.content.length === 2)
    );
  if (parent === "^")
    return (
      ["+", "*", "/"].includes(operator) ||
      operator === "-" ||
      (operator === "^" && !isRight)
    );
  return false;
}

function toString(node) {
  if (node.value !== undefined) return node.value;
  const { operator, content } = node;
  const [left, right] = content;
  const leftText = toString(left);
  if (content.length === 1) {
    return left.content?.length === 2 ? `-(${leftText})` : `-${leftText}`;
  }
  const rightText = toString(right);
  if (operator === "/") return `(${leftText})/(${rightText})`;
  const leftOperand = needsParentheses(left, operator, false)
    ? `(${leftText})`
    : leftText;
  const rightOperand = needsParentheses(right, operator, true)
    ? `(${rightText})`
    : rightText;
  return `${leftOperand}${operator}${rightOperand}`;
}

function addParentAndId(node, parent) {
  if (!node) return;
  node.parent = parent;
  if (!node.content) return;
  for (var child of node.content) {
    addParentAndId(child, node);
  }
  return node;
}
function lex(mathText) {
  return mathText.match(/\d+|\S/g) ?? [];
}

function parse(tokens) {
  const state = parseExpression(tokens);
  if (state.tokens.length)
    throw new SyntaxError("Uventet tegn etter uttrykket.");
  return state.tree;
}

function parseExpression(tokens) {
  return parseMultipart(tokens, "+-", parseTerm);
}
function parseTerm(tokens) {
  return parseMultipart(tokens, "*/", parseFactor);
}
function parseMultipart(tokens, operators, parseFn) {
  let partState1 = parseFn(tokens);
  while (operators.includes(partState1.tokens[0])) {
    const operator = partState1.tokens.shift();
    const partState2 = parseFn(partState1.tokens);
    partState1.tree = makeNode(operator, [partState1.tree, partState2.tree]);
    partState1.tokens = partState2.tokens;
  }
  return partState1;
}
function parseFactor(tokens) {
  const state = parseParenthesisValueOrUnary(tokens);
  let myTokens = state.tokens;
  if (myTokens[0] !== "^") return state;
  myTokens.shift();
  const factorState = parseFactor(myTokens);
  return makeState(
    factorState.tokens,
    makeNode("^", [state.tree, factorState.tree]),
  );
}
function parseParenthesisValueOrUnary(tokens) {
  const token = tokens.shift();
  if (token === "(") {
    const state = parseExpression(tokens);
    if (tokens.shift() !== ")")
      throw new SyntaxError("Mangler avsluttende parentes.");
    return state;
  }
  if (token === "-") {
    const state = parseFactor(tokens);
    return makeState(state.tokens, makeNode("-", [state.tree]));
  }
  if (token !== undefined && /^(?:[a-z]|\d+)$/.test(token)) {
    return makeState(tokens, makeLeaf(token));
  }
  throw new SyntaxError("Forventet et heltall, en bokstav eller en parentes.");
}

function makeNode(operator, content) {
  return {
    operator: operator,
    content: content,
  };
}
function makeLeaf(value) {
  return {
    value: value,
  };
}
function makeState(tokens, tree) {
  return {
    tokens: tokens,
    tree: tree,
  };
}
function createMenuHtml() {
  const ongoing = model.onGoingMathOperation?.name;
  return Object.keys(model.mathOperations)
    .filter(isOperationAvailable)
    .map((name) => {
      const { description } = model.mathOperations[name];
      const isHistory = [undo.name, redo.name].includes(name);
      const pressed = isHistory ? "" : `aria-pressed="${ongoing === name}"`;
      return `<button type="button" class="secondary outline" data-operation="${name}" ${pressed}>
      ${getIcon(name)}<span>${description}</span>
    </button>`;
    })
    .join("");
}

function isOperationAvailable(operationName) {
  const operation = model.mathOperations[operationName];
  return (
    model.level >= operation.levels.first &&
    (!operation.levels.last || model.level <= operation.levels.last)
  );
}
function getIcon(name) {
  const { viewBox, path } = model.mathOperations[name].svg;
  return `<svg class="svgIcon" aria-hidden="true" viewBox="0 0 ${viewBox.width} ${viewBox.height}">
    <path d="${path}"></path>
  </svg>`;
}

function createMathText(mathText, highlight) {
  const tree = parseMathText(mathText);
  return createHtml(tree, highlight);
}
function createHtml(node, highlight, showOperator) {
  const isActive = getIsActive(highlight, node);
  const operator = showOperator
    ? node.parent.operator.replace("*", "·").replace("-", "−")
    : "";
  const opHtml = operator ? `<span>${operator}</span>` : "";
  const inside = model.onGoingMathOperation?.step === "selectOneTerm";
  const content =
    node.value !== undefined
      ? `<span>${node.value}</span>`
      : createNodeHtml(node, highlight);
  if (isActive) {
    return `${inside ? "" : opHtml}<button type="button" class="flex term" data-term="${indexesFromNode(node)}"
      aria-label="${operator ? operator + " " : ""}${toString(node)}">${inside ? opHtml : ""}${content}</button>`;
  }
  return `${opHtml}<span class="flex">${content}</span>`;
}

function getIsActive(highlight, node) {
  return (
    (highlight === "selectOneTerm" && isTopLevelTerm(node)) ||
    (highlight === "selectNumber" && isNumber(node)) ||
    (highlight === "selectTopLevelFactor" && isTopLevelFactor(node)) ||
    (highlight === "selectFactorInNumerator" &&
      isFactorInDivision(node, true)) ||
    (highlight === "selectFactorInDenominator" &&
      isFactorInDivision(node, false))
  );
}
function isTopLevelFactor(node) {
  if (isTopLevelTerm(node) && node.value !== undefined) return true;
  if (isMultiplication(node) || parentOperator(node) !== "*") return false;
  const product = getTopLevelProductOfFactor(node);
  return isTopLevelTerm(product);
}
function getTopLevelProductOfFactor(node) {
  return parentOperator(node) === "*"
    ? getTopLevelProductOfFactor(node.parent)
    : node;
}
function isFactorInDivision(node, lookInNumerator) {
  const isPrimitiveOrNotProduct = !node.operator || node.operator !== "*";
  if (isNumeratorOrDenominator(node, lookInNumerator))
    return isPrimitiveOrNotProduct;
  const product = getTopLevelProductOfFactor(node);
  return (
    (node.value !== undefined || node.operator !== "*") &&
    isNumeratorOrDenominator(product, lookInNumerator)
  );
}
function isNumeratorOrDenominator(node, numerator) {
  const index = numerator ? 0 : 1;
  return parentOperator(node) === "/" && indexWithParent(node) === index;
}
function createNodeHtml(node, highlight) {
  const [left, right] = node.content;
  if (node.content.length === 1) {
    return left.content?.length === 2
      ? `<span class="flex">−(${createHtml(left, highlight)})</span>`
      : `<span class="flex">−${createHtml(left, highlight)}</span>`;
  }
  if (node.operator === "/") {
    return `<span class="flex vertical">${createHtml(left, highlight)}<span class="fraction"></span>${createHtml(right, highlight)}</span>`;
  }
  const renderOperand = (operand, isRight) => {
    const html = createHtml(operand, highlight);
    return needsParentheses(operand, node.operator, isRight)
      ? `<span class="flex">(${html})</span>`
      : html;
  };
  const symbol = node.operator === "*" ? "·" : node.operator;
  const showOperator =
    node.operator !== "*" || showMultiplicationOperator(node);
  const rightHtml = needsParentheses(right, node.operator, true)
    ? `${showOperator ? symbol : ""}${renderOperand(right, true)}`
    : createHtml(right, highlight, showOperator);
  return `<span class="flex">${renderOperand(left, false)}${rightHtml}</span>`;
}

function showMultiplicationOperator(node) {
  const isNumberOrUnaryMinusNumber =
    isNumber(node.content[0]) ||
    (isUnaryMinus(node.content[0]) && isNumber(node.content[0].content[0]));
  if (
    isNumberOrUnaryMinusNumber &&
    (isLetter(node.content[1]) || isMultiplication(node.content[1]))
  )
    return false;
  return true;
}
function selectMath(name) {
  const { steps } = model.mathOperations[name];
  model.errorMessage = "";
  model.onGoingMathOperation = { name, arguments: [], step: steps[0] };
  if (steps.length === 0) doMath();
}

function doMath(indexes) {
  const operation = model.onGoingMathOperation;
  const { run, steps } = model.mathOperations[operation.name];
  if (indexes !== undefined) operation.arguments.push(indexes);
  if (operation.arguments.length < steps.length) {
    operation.step = steps[operation.arguments.length];
    return;
  }

  const previous = model.mathText;
  try {
    run(...operation.arguments);
    parseMathText(model.mathText);
  } catch {
    model.mathText = previous;
    finishWithError("Denne operasjonen kan ikke brukes på uttrykket.");
  }

  if (
    ![undo.name, redo.name].includes(operation.name) &&
    previous !== model.mathText &&
    !model.errorMessage
  ) {
    const { items, index } = model.history;
    items.splice(index + 1, items.length, model.mathText);
    model.history.index += 1;
  }
  if (model.errorMessage) model.mathText = previous;
  model.onGoingMathOperation = null;
}

function undo() {
  const history = model.history;
  const items = history.items;
  if (items.length === 0 || history.index === 0) return;
  history.index--;
  model.mathText = items[history.index];
}
function redo() {
  const history = model.history.items;
  const index = model.history.index;
  if (index + 1 >= history.length) return;
  model.history.index++;
  model.mathText = history[model.history.index];
}
function primeFactorize(indexes) {
  const tree = parseMathText(model.mathText);
  const node = nodeFromIndexes(indexes, tree);
  if (!isNumber(node)) return;
  const number = parseInt(node.value);

  if (number < 2 || number > 1_000_000_000) {
    return finishWithError("Velg et heltall mellom 2 og 1 000 000 000.");
  }
  const primeFactors = primeFactorizeImpl(number);
  const product = parseMathText(primeFactors);
  replaceNode(node, product);
  model.mathText = toString(tree);
}
function findLowestFactor(number) {
  if (number % 2 === 0) return 2;
  for (let factor = 3; factor * factor <= number; factor += 2) {
    if (number % factor === 0) return factor;
  }
  return number;
}

function primeFactorizeImpl(number) {
  if (number <= 1) return String(number);
  const factor = findLowestFactor(number);
  if (factor === number) return String(number);
  return factor + "*" + primeFactorizeImpl(number / factor);
}

function subtractTermOnBothSides(indexes) {
  moveTermToOtherSide(indexes, true);
}
function moveTermToOtherSide(indexes, subtractOnBothSides) {
  const tree = parseMathText(model.mathText);
  const node = nodeFromIndexes(indexes, tree);
  const nodeSide = getSideOfEquation(node);
  const otherSide = 1 - nodeSide;
  const existingSign = getCombinedSignOfTopLevelTerm(node);
  let count = 0;
  while (removeUnaryMinusFactors(node, tree)) count++;
  const newSign =
    count % 2 === 1
      ? existingSign === 1
        ? "+"
        : "-"
      : existingSign === 1
        ? "-"
        : "+";
  replaceNode(
    tree.content[otherSide],
    sideWithNewNode(tree, otherSide, node, newSign),
  );
  if (subtractOnBothSides) {
    replaceNode(
      tree.content[nodeSide],
      sideWithNewNode(tree, nodeSide, node, newSign),
    );
  } else {
    replaceNode(node, {
      value: "0",
    });
  }
  addParentAndId(tree);
  doSimplifications(tree);
  model.mathText = toString(tree);
}
function removeUnaryMinusFactors(node) {
  if (node.value !== undefined || node.operator !== "*") return false;
  if (isUnaryMinus(node.content[0])) {
    replaceNode(node.content[0], node.content[0].content[0]);
    return true;
  } else {
    if (removeUnaryMinusFactors(node.content[0])) return true;
  }
  if (isUnaryMinus(node.content[1])) {
    replaceNode(node.content[1], node.content[1].content[0]);
    return true;
  } else {
    if (removeUnaryMinusFactors(node.content[1])) return true;
  }
  return false;
}
function sideWithNewNode(tree, side, node, sign) {
  const newNodeContent = [tree.content[side], node].map(cloneNode);
  return makeNode(sign, newNodeContent);
}
function getSideOfEquation(node) {
  return parentOperator(node) === "="
    ? indexWithParent(node)
    : getSideOfEquation(node.parent);
}
function mergeTerms(indexes1, indexes2) {
  const tree = parseMathText(model.mathText);
  const selectedNode1 = nodeFromIndexes(indexes1, tree);
  const selectedNode2 = nodeFromIndexes(indexes2, tree);

  if (selectedNode1 === selectedNode2) {
    return finishWithError("Velg to forskjellige ledd.");
  }
  if (nodesAreOnSeparateSides(selectedNode1, selectedNode2, tree)) {
    return finishWithError(
      "Kan bare slå sammen ledd som er på samme side av ligningen.",
    );
  }
  if (!isTopLevelTerm(selectedNode1) || !isTopLevelTerm(selectedNode2)) {
    return finishWithError(
      "Kan bare slå sammen ledd som er på toppnivå på høyre eller venstre side av ligningen.",
    );
  }
  let node1 = isUnaryMinus(selectedNode1)
    ? selectedNode1.content[0]
    : selectedNode1;
  let node2 = isUnaryMinus(selectedNode2)
    ? selectedNode2.content[0]
    : selectedNode2;
  let typeTerm1 = getType(node1);
  let typeTerm2 = getType(node2);
  if (typeTerm1 > typeTerm2)
    [node1, node2, typeTerm1, typeTerm2] = [node2, node1, typeTerm2, typeTerm1];
  if (typeTerm1 === "constant") {
    if (typeTerm2 !== "constant")
      return finishWithError(
        "Konstantledd kan bare slås sammen med andre konstantledd.",
      );
    mergeConstantAndConstant(node1, node2);
  } else if (
    typeTerm1 === "letter" &&
    ["product", "letter"].includes(typeTerm2)
  ) {
    const newNode1 = replaceLetterWithProductOfOne(node1);
    const newNode2 = replaceLetterWithProductOfOne(node2);
    addParentAndId(tree);
    mergeProductAndProduct(newNode1, newNode2);
  } else if (typeTerm1 === "product") {
    if (typeTerm2 !== "product")
      return finishWithError("Kan ikke slå sammen disse leddene.");
    mergeProductAndProduct(node1, node2);
  } else {
    return finishWithError("Kan ikke slå sammen disse leddene.");
  }
  addParentAndId(tree);
  doSimplifications(tree);
  model.mathText = toString(tree);
}
function replaceLetterWithProductOfOne(node) {
  if (!isLetter(node)) return node;
  const newNode = makeNode("*", [
    {
      value: "1",
    },
    node,
  ]);
  replaceNode(node, newNode);
  return newNode;
}
function mergeProductAndProduct(node1, node2) {
  if (!productsExceptFromFirstConstantsAreEqual(node1, node2)) {
    return finishWithError(
      "Produktledd må være like, bortsett fra ev. første konstantfaktor, for å kunne slås sammen.",
    );
  }
  const factor1 = getFirstFactorInProduct(node1);
  const factor2 = getFirstFactorInProduct(node2);
  const value1 = numberOrUnaryMinusNumberValue(factor1) ?? 1;
  const value2 = numberOrUnaryMinusNumberValue(factor2) ?? 1;
  const constant1 = value1 * getCombinedSignOfTopLevelTerm(node1);
  const constant2 = value2 * getCombinedSignOfTopLevelTerm(node2);
  const newSum = constant1 + constant2;
  const isPositive1 = constant1 > 0;
  const isPositive2 = constant2 > 0;
  if (newSum === 0) {
    replaceNode(node1, makeLeaf("0"));
    replaceNode(node2, makeLeaf("0"));
  } else if (constant1 === 0 || constant2 === 0) {
    replaceNode(constant1 === 0 ? node1 : node2, makeLeaf("0"));
  } else if (isPositive1 === isPositive2) {
    adjustFactor(node1, factor1, newSum);
    removeNode(node2);
  } else {
    const positiveNode = isPositive1 ? node1 : node2;
    const negativeNode = isPositive1 ? node2 : node1;
    const positiveFactor = isPositive1 ? factor1 : factor2;
    const negativeFactor = isPositive1 ? factor2 : factor1;
    if (newSum > 0) {
      adjustFactor(positiveNode, positiveFactor, newSum);
      removeNode(negativeNode);
    } else {
      adjustFactor(negativeNode, negativeFactor, newSum);
      removeNode(positiveNode);
    }
  }
}
function adjustFactor(node, factor, constant) {
  if (isNumber(factor)) {
    factor.value = "" + Math.abs(constant);
    return;
  }
  if (isUnaryMinus(factor)) {
    adjustConstant(factor.content[0], constant);
    return;
  }
  replaceNode(
    node,
    makeNode("*", [
      {
        value: "" + constant,
      },
      node,
    ]),
  );
}
function productsExceptFromFirstConstantsAreEqual(node1input, node2input) {
  const node1 = cloneNode(node1input);
  const node2 = cloneNode(node2input);
  const wrapper1 = createWrapperEquation(node1);
  const wrapper2 = createWrapperEquation(node2);
  const firstFactor1 = getFirstFactorInProduct(node1);
  const firstFactor2 = getFirstFactorInProduct(node2);
  const value1 = numberOrUnaryMinusNumberValue(firstFactor1);
  const value2 = numberOrUnaryMinusNumberValue(firstFactor2);
  if (value1 !== null) removeNode(firstFactor1);
  if (value2 !== null) removeNode(firstFactor2);
  return nodesAreEqual(wrapper1, wrapper2);
}
function numberOrUnaryMinusNumberValue(node) {
  if (isNumber(node)) return parseInt(node.value);
  if (isUnaryMinus(node) && isNumber(node.content[0]))
    return -1 * parseInt(node.content[0].value);
  return null;
}
function doSimplifications(node) {
  while (replaceProductsOfOne(node));
  while (removeUnariesInUnaries(node));
  while (removeUnariesInSecondPositionSubtraction(node));
  while (replaceDivideByOne(node));
  while (removeTermsZero(node));
}
function removeTermsZero(node) {
  if (
    isNumber(node) &&
    node.value === "0" &&
    "+-".includes(parentOperator(node))
  ) {
    if (isUnaryMinus(node.parent)) {
      replaceNode(node.parent, makeLeaf("0"));
    } else if (indexWithParent(node) === 0 && parentOperator(node) === "-") {
      const difference = node.parent;
      const right = difference.content[1];
      const negative = makeNode("-", [right]);
      replaceNode(difference, negative);
      right.parent = negative;
    } else {
      replaceNode(node.parent, siblingNode(node));
    }
    return true;
  }
  if (node.value !== undefined) return false;
  if (removeTermsZero(node.content[0])) return true;
  if (node.content.length > 1 && removeTermsZero(node.content[1])) return true;
  return false;
}
function replaceDivideByOne(node) {
  const isDenominator =
    parentOperator(node) === "/" && indexWithParent(node) === 1;
  if (isDenominator && node.value === "1") {
    const fraction = node.parent;
    replaceNode(fraction, fraction.content[0]);
    return true;
  }
  if (node.value !== undefined) return false;
  if (replaceDivideByOne(node.content[0])) return true;
  if (node.content.length > 1 && replaceDivideByOne(node.content[1]))
    return true;
  return false;
}
function replaceProductsOfOne(node) {
  if (node.value !== undefined) return false;
  if (node.operator !== "*") {
    if (replaceProductsOfOne(node.content[0])) return true;
    if (node.content.length > 1 && replaceProductsOfOne(node.content[1]))
      return true;
    return false;
  }
  const value1 = numberOrUnaryMinusNumberValue(node.content[0]);
  const value2 = numberOrUnaryMinusNumberValue(node.content[1]);
  const isOneOrMinus1 = Math.abs(value1) === 1;
  const isOneOrMinus2 = Math.abs(value2) === 1;
  if (!isOneOrMinus1 && replaceProductsOfOne(node.content[0])) return true;
  if (!isOneOrMinus2 && replaceProductsOfOne(node.content[1])) return true;
  if (isOneOrMinus1 || isOneOrMinus2) {
    const multiplier = isOneOrMinus1 ? value1 : value2;
    const other = node.content[isOneOrMinus1 ? 1 : 0];
    replaceNode(node, multiplier < 0 ? makeNode("-", [other]) : other);
    addParentAndId(node.parent, node.parent.parent);
    return true;
  }
  return false;
}
function removeUnariesInSecondPositionSubtraction(node) {
  if (node.value !== undefined) return false;
  if (
    node.operator === "-" &&
    node.content.length == 2 &&
    isUnaryMinus(node.content[1])
  ) {
    node.operator = "+";
    node.content[1] = node.content[1].content[0];
    node.content[1].parent = node;
    return true;
  }
  if (removeUnariesInSecondPositionSubtraction(node.content[0])) return true;
  if (
    node.content.length === 2 &&
    removeUnariesInSecondPositionSubtraction(node.content[1])
  )
    return true;
  return false;
}
function removeUnariesInUnaries(node) {
  if (node.value !== undefined) return false;
  if (isUnaryMinus(node) && isUnaryMinus(node.content[0])) {
    const newNode = node.content[0].content[0];
    replaceNode(node, newNode);
    removeUnariesInUnaries(newNode);
    return true;
  }
  if (removeUnariesInUnaries(node.content[0])) return true;
  if (node.content.length === 2 && removeUnariesInUnaries(node.content[1]))
    return true;
  return false;
}
function mergeConstantAndConstant(selectedNode1, selectedNode2) {
  const constant1 =
    parseInt(selectedNode1.value) *
    getCombinedSignOfTopLevelTerm(selectedNode1);
  const constant2 =
    parseInt(selectedNode2.value) *
    getCombinedSignOfTopLevelTerm(selectedNode2);
  const newSum = constant1 + constant2;
  const isPositive1 = constant1 > 0;
  const isPositive2 = constant2 > 0;
  if (newSum === 0) {
    replaceNode(selectedNode1, makeLeaf("0"));
    replaceNode(selectedNode2, makeLeaf("0"));
  } else if (isPositive1 === isPositive2) {
    adjustConstant(selectedNode1, newSum);
    removeNode(selectedNode2);
  } else {
    const positiveNode = isPositive1 ? selectedNode1 : selectedNode2;
    const negativeNode = isPositive1 ? selectedNode2 : selectedNode1;
    if (newSum > 0) {
      adjustConstant(positiveNode, newSum);
      removeNode(negativeNode);
    } else {
      adjustConstant(negativeNode, newSum);
      removeNode(positiveNode);
    }
  }
}
function getType(node) {
  if (node.value !== undefined) {
    if (isNumber(node)) return "constant";
    if (isLetter(node)) return "letter";
    throw "unknown type: " + toString(node);
  }
  if (isUnaryMinus(node)) return "unary minus";
  if (isMultiplication(node)) return "product";
  if (isDivision(node)) return "division";
  throw "unknown type: " + toString(node);
}
function adjustConstant(node, newConstant) {
  node.value = String(Math.abs(newConstant));
}
function finishWithError(errorMessage) {
  model.errorMessage = errorMessage;
}

function createWrapperEquation(node) {
  const equation = makeNode("=", [
    {
      value: 1,
    },
    node,
  ]);
  addParentAndId(equation);
  return equation;
}
function getFirstFactorInProduct(product) {
  return isMultiplication(product.content[0])
    ? getFirstFactorInProduct(product.content[0])
    : product.content[0];
}
function getCombinedSignOfTopLevelTerm(node) {
  if (node.parent.operator === "=") return 1;
  const factor =
    node.parent.operator !== "-" ||
    (node.parent.content.length === 2 && node.parent.content[0] === node)
      ? 1
      : -1;
  return factor * getCombinedSignOfTopLevelTerm(node.parent);
}
function nodesAreOnSeparateSides(node1, node2, tree) {
  const firstIndexOnRightSide = indexesFromNode(tree.content[1]);
  const node1Side = indexesFromNode(node1) < firstIndexOnRightSide;
  const node2Side = indexesFromNode(node2) < firstIndexOnRightSide;
  return node1Side !== node2Side;
}
function nodesAreEqual(node1, node2) {
  const equalPrimitives =
    node1.value && node2.value && node1.value === node2.value;
  if (equalPrimitives) return true;
  return (
    node1.operator === node2.operator &&
    node1.content &&
    node2.content &&
    nodesAreEqual(node1.content[0], node2.content[0]) &&
    node1.content.length > 1 &&
    node2.content.length > 1 &&
    nodesAreEqual(node1.content[1], node2.content[1])
  );
}
function removeNode(node) {
  const parent = node.parent;
  if (
    parent.operator === "-" &&
    parent.content.length === 2 &&
    indexWithParent(node) === 0
  ) {
    parent.content.shift();
  } else if (isUnaryMinus(node.parent)) {
    removeNode(node.parent);
  } else {
    replaceNode(parent, siblingNode(node));
  }
}
function siblingNode(node) {
  const index = indexWithParent(node);
  const siblingIndex = otherIndex(index);
  return node.parent.content[siblingIndex];
}
function replaceNode(node, newNode) {
  node.parent.content[indexWithParent(node)] = newNode;
  newNode.parent = node.parent;
}
function otherIndex(index) {
  return index === 1 ? 0 : 1;
}
function indexWithParent(node) {
  return node.parent.content[0] === node ? 0 : 1;
}
function reduceFraction(indexes1, indexes2) {
  const tree = parseMathText(model.mathText);
  const node1 = nodeFromIndexes(indexes1, tree);
  const node2 = nodeFromIndexes(indexes2, tree);
  const fraction = getTopLevelProductOfFactor(node1).parent;

  if (fraction !== getTopLevelProductOfFactor(node2).parent) {
    return finishWithError("Velg to faktorer i den samme brøken.");
  }
  if (numberOrUnaryMinusNumberValue(node2) === 0) {
    return finishWithError("Du kan ikke forkorte med null.");
  }
  if (!nodesAreEqual(node1, node2)) {
    return finishWithError(
      "Faktorene er ulike og kan ikke forkortes mot hverandre.",
    );
  }
  replaceNode(node1, {
    value: "1",
  });
  replaceNode(node2, {
    value: "1",
  });
  for (const part of fraction.content) {
    const value = getIntegerProduct(part);
    if (value === null) continue;
    const positive = makeLeaf(String(Math.abs(value)));
    replaceNode(part, value < 0 ? makeNode("-", [positive]) : positive);
  }
  addParentAndId(tree);
  doSimplifications(tree);
  model.mathText = toString(tree);
}
function getIntegerProduct(node) {
  if (!isMultiplication(node)) return numberOrUnaryMinusNumberValue(node);
  const [left, right] = node.content.map(getIntegerProduct);
  if (left === null || right === null) return null;
  const product = left * right;
  return Number.isSafeInteger(product) ? product : null;
}
function divideBothSides(indexes) {
  const tree = parseMathText(model.mathText);
  const node = nodeFromIndexes(indexes, tree);

  if (numberOrUnaryMinusNumberValue(node) === 0) {
    return finishWithError("Du kan ikke dele på null.");
  }
  replaceNode(
    tree.content[0],
    makeNode("/", [tree.content[0], cloneNode(node)]),
  );
  replaceNode(
    tree.content[1],
    makeNode("/", [tree.content[1], cloneNode(node)]),
  );
  model.mathText = toString(tree);
}
function cloneNode(node) {
  if (node.value != undefined)
    return {
      value: node.value,
    };
  return node.content.length === 1
    ? makeNode(node.operator, [cloneNode(node.content[0])])
    : makeNode(node.operator, [
        cloneNode(node.content[0]),
        cloneNode(node.content[1]),
      ]);
}
const model = {
  level: 1,
  mathText: "x=1+2",
  onGoingMathOperation: null,
  errorMessage: "",
  history: {
    items: [],
    index: 0,
  },
  steps: {
    selectOneTerm: "Velg et ledd.",
    selectFactorInNumerator: "Velg en faktor i telleren.",
    selectFactorInDenominator: "Velg en faktor i nevneren.",
    selectTopLevelFactor: "Velg et ledd eller en faktor i et ledd.",
    selectNumber: "Velg et tall.",
  },
  mathOperations: {},
  youTubeVideoIds: [
    "",
    "4yY3GJ2VJR8",
    "ppjutK7iwu8",
    "kPK-rbW7Jy8",
    "zAbQeidbWdc",
    "rgdP8DK9cQ8",
    "QejFqIPpos4",
  ],
};
model.mathOperations[mergeTerms.name] = {
  run: mergeTerms,
  steps: ["selectOneTerm", "selectOneTerm"],
  svg: {
    path: "M 3.34 4.7 h -3.2577 v -0.5264 l 1.8548 -1.8411 l -1.8273 -1.7391 v -0.5181 h 3.1226 v 0.4851 h -2.4557 l 1.7859 1.6564 v 0.1984 l -1.8355 1.7997 h 2.6128 z",
    viewBox: {
      width: 3.34,
      height: 4.7,
    },
  },
  description: "Slå sammen ledd",
  levels: {
    first: 1,
  },
};
model.mathOperations[subtractTermOnBothSides.name] = {
  run: subtractTermOnBothSides,
  steps: ["selectOneTerm"],
  svg: {
    path: "M 0.5796 5.4688 h -0.4796 v -5.3688 h 0.4796 z m 3 -2.6 h -1.7198 v -0.4989 h 1.7198 z",
    viewBox: {
      width: 3.5,
      height: 5.5,
    },
  },
  description: "Trekk fra på begge sider",
  levels: {
    first: 2,
    last: 3,
  },
};
model.mathOperations[moveTermToOtherSide.name] = {
  run: moveTermToOtherSide,
  steps: ["selectOneTerm"],
  svg: {
    path: "M 0.1 5.8787 q 0 -2.3974 1.6946 -4.0841 q 1.6946 -1.6946 4.0841 -1.6946 q 1.7805 0 3.1783 0.9371 q 1.3978 0.9293 2.1631 2.6316 l 1.1323 -1.3041 l -0.5076 3.8186 l -3.0533 -2.3427 q 1.3822 0.2968 1.718 0.125 l -0.2108 -0.4451 q -1.4915 -2.6551 -4.4121 -2.6551 q -2.0772 0 -3.5453 1.4681 q -1.4681 1.4681 -1.4681 3.5453 z m 8.7 2 h -6.1288 v -0.8268 h 6.1288 z m 0 2.1704 h -6.1288 v -0.8268 h 6.1288 z",
    viewBox: {
      width: 12.5,
      height: 10.5,
    },
  },
  description: "Flytt ledd",
  levels: {
    first: 4,
  },
};
model.mathOperations[divideBothSides.name] = {
  run: divideBothSides,
  steps: ["selectTopLevelFactor"],
  svg: {
    path: "M 0.5796 5.4688 h -0.4796 v -5.3688 h 0.4796 z m 3 -2.6 h -1.7198 v -0.4989 h 1.7198 z m -0.6 -0.8 h -0.5 v -0.4989 h 0.5 z  m 0 1.6 h -0.5 v -0.4989 h 0.5 z",
    viewBox: {
      width: 3.5,
      height: 5.5,
    },
  },
  description: "Del på begge sider",
  levels: {
    first: 5,
  },
};
model.mathOperations[reduceFraction.name] = {
  run: reduceFraction,
  steps: ["selectFactorInNumerator", "selectFactorInDenominator"],
  svg: {
    path: "M 10 1 l -3.7052 9.6118 h -0.894 l 3.6897 -9.6118 z m 3 12 h -12 v -0.8268 h 12 z m -3 1.3 l -3.7052 9.6118 h -0.894 l 3.6897 -9.6118 z",
    viewBox: {
      width: 14,
      height: 24,
    },
  },
  description: "Forkort brøk",
  levels: {
    first: 5,
  },
};
model.mathOperations[primeFactorize.name] = {
  run: primeFactorize,
  steps: ["selectNumber"],
  svg: {
    path: "m 6.2 0.1 h 4.8782 v 4.8782 h -4.8782 z m 0.3927 0.3927 v 4.0928 h 4.0928 v -4.0928 z m -4 10.5 v -2.7027 l 1.08 1.08 l 4.0566 -4.0566 l 0.5426 0.5426 l -4.0566 4.0566 l 1.08 1.08 z m 12 0 v -2.7027 l -1.08 1.08 l -4.0566 -4.0566 l -0.5426 0.5426 l 4.0566 4.0566 l -1.08 1.08 z m -14.4 0.4 h 4.8782 v 4.8782 h -4.8782 z m 0.3927 0.3927 v 4.0928 h 4.0928 v -4.0928 z m 11.5 -0.376 h 4.8782 v 4.8782 h -4.8782 z m 0.3927 0.3927 v 4.0928 h 4.0928 v -4.0928 z m -1.08 4.2 l -0.5736 0.5736 l -2.2531 -2.2738 l -2.2531 2.2738 l -0.5736 -0.5736 l 2.2738 -2.2531 l -2.2738 -2.2531 l 0.5736 -0.5736 l 2.2531 2.2738 l 2.2531 -2.2738 l 0.5736 0.5736 l -2.2738 2.2531 z",
    viewBox: {
      width: 17,
      height: 17,
    },
  },
  description: "Primtallsfaktoriser",
  levels: {
    first: 6,
  },
};
model.mathOperations[undo.name] = {
  run: undo,
  steps: [],
  svg: {
    path: "m 0.1 2.2 l 2.0826 -2.0877 v 1.0697 h 2.7182 q 1.4624 0 2.0671 0.4651 q 0.4651 0.3514 0.6201 0.8268 q 0.1602 0.4703 0.1602 1.5038 v 1.0284 h -0.2532 v -0.1395 q 0 -0.9302 -0.4341 -1.2867 q -0.4289 -0.3617 -1.5451 -0.3617 h -3.3331 v 1.0697 z",
    viewBox: {
      width: 8,
      height: 5,
    },
  },
  description: "Angre",
  levels: {
    first: 0,
  },
};
model.mathOperations[redo.name] = {
  run: redo,
  steps: [],
  svg: {
    path: "m 7.8 2.2 l -2.0877 2.0877 v -1.0697 h -3.328 q -1.1214 0 -1.5503 0.3617 q -0.4289 0.3566 -0.4289 1.2867 v 0.1395 h -0.2532 v -1.0284 q 0 -1.0335 0.155 -1.5038 q 0.1602 -0.4754 0.6201 -0.8268 q 0.6046 -0.4651 2.0671 -0.4651 h 2.7182 v -1.0697 z",
    viewBox: {
      width: 8,
      height: 5,
    },
  },
  description: "Gjør om",
  levels: {
    first: 0,
  },
};
function updateView() {
  const {
    history,
    onGoingMathOperation: operation,
    level,
    errorMessage,
    mathText,
  } = model;
  const math = document.querySelector("#mathContent");
  math.innerHTML = createMathText(mathText, operation?.step);
  math.setAttribute("aria-label", `Ligning ${mathText}`);

  const list = document.querySelector("#solver-history");
  list.replaceChildren(
    ...history.items.map((item, index) => {
      const line = document.createElement("li");
      line.textContent = item;
      if (index === history.index) line.setAttribute("aria-current", "step");
      return line;
    }),
  );
  document.querySelector("#history-panel").hidden = history.items.length === 1;
  document.querySelector("#solver-menu").innerHTML = createMenuHtml();
  document.querySelector("#solver-levels").innerHTML = createLevelsMenuHtml();
  document.querySelector("#new-exercise").textContent =
    `Ny oppgave på nivå ${level}`;

  const message =
    errorMessage ||
    (operation
      ? `${model.mathOperations[operation.name].description}. ${model.steps[operation.step]}`
      : isEquationSolved(mathText)
        ? "Ligningen er løst."
        : "Velg en operasjon.");
  const text = document.querySelector("#solver-message");
  text.textContent = message;
  text.classList.toggle("error", Boolean(errorMessage));
  if (video.open) updateVideo();
}

function newExercise() {
  const fn = levelExerciseFunctions[model.level];
  newExerciseImpl(fn());
}
function newCustomExercise(input) {
  const exercise = input.replace(/−/g, "-").trim();
  try {
    if (!exercise.includes("=") || /\d{7}/.test(exercise))
      throw new SyntaxError();
    const tree = parseMathText(exercise);
    if (hasZeroDenominator(tree)) throw new RangeError();
  } catch {
    finishWithError(
      "Skriv en ligning med heltall på opptil seks sifre, for eksempel 2*x + 3 = 11. Nevneren kan ikke være null.",
    );
    model.onGoingMathOperation = null;
    return;
  }
  newExerciseImpl(exercise);
}

function hasZeroDenominator(node) {
  if (!node.content) return false;
  if (node.operator === "/" && getIntegerProduct(node.content[1]) === 0)
    return true;
  return node.content.some(hasZeroDenominator);
}

function newExerciseImpl(exercise) {
  model.errorMessage = "";
  model.mathText = exercise;
  model.history.items = [exercise];
  model.history.index = 0;
  model.onGoingMathOperation = null;
}

function createLevelsMenuHtml() {
  return range(1, 7)
    .map(
      (level) => `<button type="button" class="secondary outline"
    aria-label="Nivå ${level}" aria-pressed="${level === model.level}" data-level="${level}">${level}</button>`,
    )
    .join("");
}

function selectLevel(level) {
  model.level = level;
  model.onGoingMathOperation = null;
  model.errorMessage = "";
}

function isEquationSolved(mathText) {
  const { content } = parseMathText(mathText);
  const variable = content.findIndex(isLetter);
  if (variable === -1) return false;
  const other = content[1 - variable];
  if (numberOrUnaryMinusNumberValue(other) !== null) return true;
  if (other.operator !== "/") return false;
  const [numerator, denominator] = other.content.map(
    numberOrUnaryMinusNumberValue,
  );
  if (numerator === null || denominator === null || denominator <= 1)
    return false;
  let a = Math.abs(numerator);
  let b = denominator;
  while (b !== 0) [a, b] = [b, a % b];
  return a === 1;
}

const app = document.querySelector("#app");
const video = document.querySelector("#solver-video");

function updateVideo() {
  const player = video.querySelector(".video-player");
  const id = model.youTubeVideoIds[model.level];
  if (player?.dataset.videoId === id) return;
  player?.remove();

  const container = document.createElement("div");
  container.className = "video-player";
  container.dataset.videoId = id;
  const frame = document.createElement("iframe");
  frame.src = `https://www.youtube-nocookie.com/embed/${id}`;
  frame.title = `Forklaringsvideo for nivå ${model.level}`;
  frame.allowFullscreen = true;
  const link = document.createElement("a");
  link.href = `https://www.youtube.com/watch?v=${id}`;
  link.textContent = "Se på YouTube";
  container.append(frame, link);
  video.append(container);
}

video.addEventListener("toggle", () => {
  if (video.open) updateVideo();
  else video.querySelector(".video-player")?.remove();
});

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { operation, term, level } = button.dataset;
  if (operation !== undefined) selectMath(operation);
  else if (term !== undefined) doMath(term);
  else if (level !== undefined) selectLevel(Number(level));
  else if (button.id === "new-exercise") newExercise();
  else return;

  updateView();
  if (operation !== undefined) {
    const next =
      app.querySelector("[data-term]") ??
      app.querySelector(`[data-operation="${operation}"]`);
    next?.focus();
  } else if (term !== undefined) {
    const next =
      app.querySelector("[data-term]") ?? app.querySelector("#mathContent");
    next.focus();
  } else if (level !== undefined) {
    app.querySelector(`[data-level="${level}"]`).focus();
  }
});

document
  .querySelector("#custom-exercise")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    newCustomExercise(event.currentTarget.elements.equation.value);
    updateView();
    if (model.errorMessage) event.currentTarget.elements.equation.focus();
    else app.querySelector("#mathContent").focus();
  });

newExercise();
updateView();
app.hidden = false;
