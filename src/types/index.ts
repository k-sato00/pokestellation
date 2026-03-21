export interface Star {
    id: number;
    x: number;
    y: number;
}

export interface ImageProperties {
    url: string;
    opacity: number;
}

export interface Constellation {
    stars: Star[];
    image: ImageProperties;
}