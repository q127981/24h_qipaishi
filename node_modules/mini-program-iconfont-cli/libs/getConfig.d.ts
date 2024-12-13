export interface Config {
    symbol_url: string;
    save_dir: string;
    use_rpx: boolean;
    trim_icon_prefix: string;
    default_icon_size: number;
}
export declare const getConfig: () => Config;
