; Konomi IgnAIte - Shared Kernel Macros
; Include in all .asm files: %include "macros.inc"

; Boot sector setup
%macro BOOT_SETUP 0
    [BITS 16]
    [ORG 0x7C00]
    cli
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    sti
%endmacro

; Set video mode 80x25
%macro VIDEO_MODE 0
    mov ax, 0x0003
    int 0x10
%endmacro

; Hide cursor
%macro HIDE_CURSOR 0
    mov ah, 0x01
    mov cx, 0x2607
    int 0x10
%endmacro

; Print string at SI via BIOS
%macro PRINT 1
    mov si, %1
    call print_string
%endmacro

; Print newline
%macro NEWLINE 0
    mov ah, 0x0E
    mov al, 13
    int 0x10
    mov al, 10
    int 0x10
%endmacro

; Wait for keypress
%macro WAIT_KEY 0
    mov ah, 0x00
    int 0x16
%endmacro

; Halt system
%macro HALT 0
%%loop:
    hlt
    jmp %%loop
%endmacro

; Boot signature (place at end)
%macro BOOT_SIG 0
    times 510-($-$$) db 0
    dw 0xAA55
%endmacro

; Common color attributes
%define ATTR_BLACK   0x00
%define ATTR_BLUE    0x01
%define ATTR_GREEN   0x02
%define ATTR_CYAN    0x03
%define ATTR_RED     0x04
%define ATTR_MAGENTA 0x05
%define ATTR_ORANGE  0x06
%define ATTR_WHITE   0x07
%define ATTR_BRIGHT  0x08

; Video memory segment
%define VIDEO_SEG 0xB800

; Standard print_string routine
; Call with SI pointing to null-terminated string
print_string:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    mov bx, 0x0007
    int 0x10
    jmp print_string
.done:
    ret
