import Stack from './stack'

test('stack: newly constructed stacks should be empty', () => {
    const stack = new Stack();
    expect(stack.isEmpty).toBeTruthy();
});

test('stack: stacks with elements should not be empty', () => {
    const stack = new Stack();
    stack.push(0);
    expect(stack.isEmpty).toBeFalsy();
});

test('stack: stack peek', () => {
    const stack = new Stack();
    stack.push('a');
    expect(stack.peek()).toStrictEqual('a');
});

test('stack: stack push', () => {
    const stack = new Stack();
    stack.push('a');
    expect(stack.peek()).toStrictEqual('a');
    stack.push('b');
    expect(stack.peek()).toStrictEqual('b');
    stack.push('c');
    expect(stack.peek()).toStrictEqual('c');
});

test('stack: stack pop', () => {
    const stack = new Stack();
    stack.push('a');
    stack.push('b');
    stack.push('c');
    expect(stack.pop()).toStrictEqual('c');
    expect(stack.pop()).toStrictEqual('b');
    expect(stack.pop()).toStrictEqual('a');
});
