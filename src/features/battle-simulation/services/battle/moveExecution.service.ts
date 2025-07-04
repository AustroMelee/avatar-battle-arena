// CONTEXT: Move Execution Service
// RESPONSIBILITY: Route moves to appropriate execution services

import { executeMove } from './moveRouter.service';
import { executeTacticalMove } from './tacticalMove.service';

// Re-export the main execution functions
export { executeMove, executeTacticalMove };

// Re-export result types for backward compatibility
export type { MoveExecutionResult } from './moveRouter.service'; 