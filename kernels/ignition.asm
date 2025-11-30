; Konomi IgnAIte - Ignition Gateway Kernel
; Industrial automation focused bootloader
; nasm -f bin ignition.asm -o ignition.bin

[BITS 16]
[ORG 0x7C00]

; Constants
%define VIDEO_MEM 0xB800
%define ATTR_ORANGE 0x06
%define ATTR_GREEN 0x0A
%define ATTR_WHITE 0x0F

start:
    cli
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    sti

    ; Set video mode 80x25 text
    mov ax, 0x0003
    int 0x10

    ; Hide cursor
    mov ah, 0x01
    mov cx, 0x2607
    int 0x10

    ; Draw header bar
    mov ax, VIDEO_MEM
    mov es, ax
    xor di, di
    mov cx, 80
    mov ax, 0x6020     ; Orange bg, space
.header:
    stosw
    loop .header

    ; Print title on header
    mov di, 4
    mov si, title
    mov ah, 0x60       ; Orange bg, black text
    call print_at

    ; Print logo
    mov di, 320        ; Row 2
    mov si, logo1
    mov ah, ATTR_ORANGE
    call print_at
    mov di, 480
    mov si, logo2
    call print_at
    mov di, 640
    mov si, logo3
    call print_at

    ; Print system info
    mov di, 960        ; Row 6
    mov si, msg_sys
    mov ah, ATTR_WHITE
    call print_at

    ; Print gateway status
    mov di, 1120
    mov si, msg_gw
    mov ah, ATTR_GREEN
    call print_at

    ; Print modules
    mov di, 1440       ; Row 9
    mov si, msg_mod1
    mov ah, ATTR_WHITE
    call print_at
    mov di, 1600
    mov si, msg_mod2
    call print_at
    mov di, 1760
    mov si, msg_mod3
    call print_at

    ; Print prompt
    mov di, 2080       ; Row 13
    mov si, prompt
    mov ah, ATTR_ORANGE
    call print_at

    ; Command loop
cmd_loop:
    call read_char
    cmp al, 13         ; Enter
    je .exec_cmd
    cmp al, 8          ; Backspace
    je .backspace
    ; Echo char
    mov ah, 0x0E
    int 0x10
    jmp cmd_loop

.backspace:
    mov ah, 0x0E
    mov al, 8
    int 0x10
    mov al, ' '
    int 0x10
    mov al, 8
    int 0x10
    jmp cmd_loop

.exec_cmd:
    ; New line
    mov ah, 0x0E
    mov al, 13
    int 0x10
    mov al, 10
    int 0x10
    ; Print status
    mov si, msg_ok
    call print_bios
    ; Print prompt again
    mov si, prompt
    call print_bios
    jmp cmd_loop

; Print string at ES:DI with attribute AH
print_at:
    lodsb
    or al, al
    jz .done
    stosw
    jmp print_at
.done:
    ret

; Print via BIOS
print_bios:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp print_bios
.done:
    ret

; Read char into AL
read_char:
    mov ah, 0x00
    int 0x16
    ret

; Data
title:    db ' KONOMI IgnAIte Gateway v1.0 ', 0
logo1:    db '  IgnAIte Gateway Kernel', 0
logo2:    db '  Industrial Automation OS', 0
logo3:    db '  Browser-Based SCADA', 0
msg_sys:  db '  System: x86 Real Mode | Memory: 640KB', 0
msg_gw:   db '  Gateway: [RUNNING] Port 8088', 0
msg_mod1: db '  [*] Perspective Module', 0
msg_mod2: db '  [*] OPC-UA Server', 0
msg_mod3: db '  [*] Tag Provider', 0
prompt:   db 'ignition> ', 0
msg_ok:   db '[OK] Command executed', 13, 10, 0

; Padding and signature
times 510-($-$$) db 0
dw 0xAA55
