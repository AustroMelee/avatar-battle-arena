// Global CSS type definitions for build system. See SYSTEM ARCHITECTURE.MD for flow.
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
} 