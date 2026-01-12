const greeting: string = 'Hello, TypeScript!';

function sayHello(name: string): string {
  return `${greeting} Welcome, ${name}`;
}

sayHello('World');

export default sayHello;
