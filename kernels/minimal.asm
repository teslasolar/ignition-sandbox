; Konomi IgnAIte - Minimal Bootloader
; 512-byte boot sector for v86-lite
; nasm -f bin minimal.asm -o minimal.bin

[BITS 16]
[ORG 0x7C00]

start:
    ; Setup segments
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00

    ; Clear screen
    mov ax, 0x0003
    int 0x10

    ; Set text color (orange on black)
    mov ah, 0x0B
    mov bh, 0x00
    mov bl, 0x06
    int 0x10

    ; Print boot message
    mov si, msg_boot
    call print_string

    ; Print logo
    mov si, logo
    call print_string

    ; Print ready message
    mov si, msg_ready
    call print_string

    ; Halt with blinking cursor
.halt:
    mov ah, 0x00
    int 0x16        ; Wait for keypress
    jmp .halt

; Print null-terminated string at SI
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

; Data section
msg_boot:   db 'Konomi IgnAIte v1.0', 13, 10
            db 'Minimal Kernel', 13, 10, 13, 10, 0

logo:       db '  _  __                      _', 13, 10
            db ' | |/ /___  _ __   ___  _ __ (_)', 13, 10
            db ' | . // _ \| ._ \ / _ \| ._ \| |', 13, 10
            db ' | |\ \ (_) | | | | (_) | | | | |', 13, 10
            db ' |_| \_\___/|_| |_|\___/|_| |_|_|', 13, 10
            db 13, 10, 0

msg_ready:  db 'Boot complete. Press any key...', 13, 10, 0

; Boot signature
times 510-($-$$) db 0
dw 0xAA55
