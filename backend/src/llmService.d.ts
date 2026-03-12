import { z } from "zod";
export declare const generationSchema: z.ZodObject<{
    reply: z.ZodString;
    blocks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<{
            custom: "custom";
            setup: "setup";
            character: "character";
            movement: "movement";
            collision: "collision";
            event: "event";
            score: "score";
            timer: "timer";
            visual: "visual";
            sound: "sound";
        }>;
        label: z.ZodString;
        emoji: z.ZodString;
        enabled: z.ZodBoolean;
        params: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                color: "color";
                enum: "enum";
            }>;
            value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            step: z.ZodOptional<z.ZodNumber>;
            options: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        code: z.ZodString;
        css: z.ZodOptional<z.ZodString>;
        order: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type GenerationResult = z.infer<typeof generationSchema>;
export declare class LLMService {
    constructor();
    generateStream(messages: Array<{
        role: string;
        content: string;
    }>, currentBlocks?: string, language?: string): Promise<import("ai").StreamObjectResult<{
        reply?: string;
        blocks?: ({
            id?: string;
            type?: "custom" | "setup" | "character" | "movement" | "collision" | "event" | "score" | "timer" | "visual" | "sound";
            label?: string;
            emoji?: string;
            enabled?: boolean;
            params?: ({
                key?: string;
                label?: string;
                type?: "string" | "number" | "boolean" | "color" | "enum";
                value?: string | number | boolean;
                min?: number | undefined;
                max?: number | undefined;
                step?: number | undefined;
                options?: (string | undefined)[] | undefined;
            } | undefined)[];
            code?: string;
            order?: number;
            css?: string | undefined;
        } | undefined)[];
    }, {
        reply: string;
        blocks: {
            id: string;
            type: "custom" | "setup" | "character" | "movement" | "collision" | "event" | "score" | "timer" | "visual" | "sound";
            label: string;
            emoji: string;
            enabled: boolean;
            params: {
                key: string;
                label: string;
                type: "string" | "number" | "boolean" | "color" | "enum";
                value: string | number | boolean;
                min?: number | undefined;
                max?: number | undefined;
                step?: number | undefined;
                options?: string[] | undefined;
            }[];
            code: string;
            order: number;
            css?: string | undefined;
        }[];
    }, never>>;
    convertToBlocks(code: string, language?: string): Promise<import("ai").StreamObjectResult<{
        blocks?: ({
            id?: string;
            type?: "custom" | "setup" | "character" | "movement" | "collision" | "event" | "score" | "timer" | "visual" | "sound";
            label?: string;
            emoji?: string;
            enabled?: boolean;
            params?: ({
                key?: string;
                label?: string;
                type?: "string" | "number" | "boolean" | "color" | "enum";
                value?: string | number | boolean;
                min?: number | undefined;
                max?: number | undefined;
                step?: number | undefined;
                options?: (string | undefined)[] | undefined;
            } | undefined)[];
            code?: string;
            order?: number;
            css?: string | undefined;
        } | undefined)[];
    }, {
        blocks: {
            id: string;
            type: "custom" | "setup" | "character" | "movement" | "collision" | "event" | "score" | "timer" | "visual" | "sound";
            label: string;
            emoji: string;
            enabled: boolean;
            params: {
                key: string;
                label: string;
                type: "string" | "number" | "boolean" | "color" | "enum";
                value: string | number | boolean;
                min?: number | undefined;
                max?: number | undefined;
                step?: number | undefined;
                options?: string[] | undefined;
            }[];
            code: string;
            order: number;
            css?: string | undefined;
        }[];
    }, never>>;
}
export declare const llmService: LLMService;
//# sourceMappingURL=llmService.d.ts.map