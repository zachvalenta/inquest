// AUTOGENERATED FROM scripts/make_resolvers.py DO NOT MODIFY
import { CodeResolver } from "./code_resolver";
import { FileResolver } from "./file_resolver";
import { LiveTailResolver } from "./live_tail_resolver";
import { ProbeFailureResolver } from "./probe_failure_resolver";
import { ProbeResolver } from "./probe_resolver";
import { TraceResolver } from "./trace_resolver";
import { TraceSetResolver } from "./trace_set_resolver";
import { UserResolver } from "./user_resolver";

export const ALL_RESOLVERS = [
    CodeResolver,
    FileResolver,
    LiveTailResolver,
    ProbeFailureResolver,
    ProbeResolver,
    TraceResolver,
    TraceSetResolver,
    UserResolver,
];
