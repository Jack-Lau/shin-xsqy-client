module RichTextUtils {
    type RGB = string;
    type Path = string;
    type Size = number;
    type Width = number;

    interface RT {
        content: string;
        read (input: string);
        show (): string;
    }
}