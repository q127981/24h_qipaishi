export interface XmlData {
    svg: {
        symbol: Array<{
            $: {
                viewBox: string;
                id: string;
            };
            path: Array<{
                $: {
                    d: string;
                    fill?: string;
                };
            }>;
        }>;
    };
}
export declare const fetchXml: (url: any) => Promise<XmlData>;
