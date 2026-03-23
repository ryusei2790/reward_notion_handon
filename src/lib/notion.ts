import  { Client } from "@notionhq/client";
import type {
    BlockObjectResponse,
    PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export function createNotionClient(apiKey: string): Client {
    return new Client({ auth: apiKey });
}

export interface NotionTodoBlock {
    block_id: string;
    title: string;
    is_checked: boolean;
}

export async function fetchNotionTodos(
    apiKey: string, 
    pageId: string
): Promise<NotionTodoBlock[]> {
    const notion = createNotionClient(apiKey);
    const todos: NotionTodoBlock[] = [];
    let cursor: string | undefined = undefined;

    do { 
        const response = await notion.blocks.children.list({
            block_id: pageId, 
            start_cursor: cursor,
            page_size: 100,
        });

        for (const block of response.results) {
            if (!isFullBlock(block)) continue;
            if (block.type !== "to_do") continue;

            const todo = block.to_do;
            const title = todo.rich_text.map((t) => t.plain_text).join("");
            todos.push({
                block_id: block.id,
                title,
                is_checked: todo.checked,
            });
        }

        cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
    } while (cursor);

    return todos;
}

export  async function updateNotionTodoChecked(
    apiKey: string, 
    blockId: string,
    checked: boolean
): Promise<void> {
    const notion = createNotionClient(apiKey);
    await notion.blocks.update({
        block_id: blockId,
        to_do: { checked } as any,
    });
}

function isFullBlock(
    block: BlockObjectResponse | PartialBlockObjectResponse
): block is BlockObjectResponse {
    return "type" in block;
}