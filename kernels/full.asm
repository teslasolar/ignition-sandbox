; Konomi IgnAIte - Full OS Kernel
; Complete shell with command interpreter
; nasm -f bin full.asm -o full.bin

[BITS 16]
[ORG 0x7C00]

%define MAX_CMD 64

section .text
start:
    cli
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    sti

    ; Clear screen
    mov ax, 0x0003
    int 0x10

    ; Print boot sequence
    mov si, msg_boot1
    call print
    mov si, msg_boot2
    call print
    mov si, msg_boot3
    call print
    mov si, msg_boot4
    call print
    mov si, msg_boot5
    call print
    mov si, msg_logo
    call print
    mov si, msg_welcome
    call print

shell:
    ; Print prompt
    mov si, prompt
    call print

    ; Read command
    mov di, cmd_buf
    xor cx, cx

.read_loop:
    mov ah, 0x00
    int 0x16

    cmp al, 13          ; Enter
    je .execute
    cmp al, 8           ; Backspace
    je .backspace
    cmp cl, MAX_CMD-1
    jge .read_loop

    ; Store and echo
    stosb
    inc cl
    mov ah, 0x0E
    int 0x10
    jmp .read_loop

.backspace:
    or cl, cl
    jz .read_loop
    dec di
    dec cl
    mov ah, 0x0E
    mov al, 8
    int 0x10
    mov al, ' '
    int 0x10
    mov al, 8
    int 0x10
    jmp .read_loop

.execute:
    mov byte [di], 0    ; Null terminate
    call newline

    ; Empty command?
    or cl, cl
    jz shell

    ; Parse command
    mov si, cmd_buf

    ; Check 'help'
    mov di, cmd_help
    call strcmp
    jz .do_help

    ; Check 'clear'
    mov di, cmd_clear
    call strcmp
    jz .do_clear

    ; Check 'uname'
    mov di, cmd_uname
    call strcmp
    jz .do_uname

    ; Check 'ignition'
    mov di, cmd_ign
    call strcmp
    jz .do_ignition

    ; Check 'status'
    mov di, cmd_stat
    call strcmp
    jz .do_status

    ; Check 'reboot'
    mov di, cmd_reboot
    call strcmp
    jz .do_reboot

    ; Unknown command
    mov si, msg_unknown
    call print
    jmp shell

.do_help:
    mov si, help_text
    call print
    jmp shell

.do_clear:
    mov ax, 0x0003
    int 0x10
    jmp shell

.do_uname:
    mov si, uname_text
    call print
    jmp shell

.do_ignition:
    mov si, ign_text
    call print
    jmp shell

.do_status:
    mov si, status_text
    call print
    jmp shell

.do_reboot:
    mov si, msg_reboot
    call print
    ; Wait then reboot
    mov cx, 0xFFFF
.wait:
    loop .wait
    jmp 0xFFFF:0x0000

; Print null-terminated string at SI
print:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    mov bx, 0x0007
    int 0x10
    jmp print
.done:
    ret

; Print newline
newline:
    mov ah, 0x0E
    mov al, 13
    int 0x10
    mov al, 10
    int 0x10
    ret

; Compare strings SI and DI, ZF set if equal
strcmp:
    push si
    push di
.loop:
    lodsb
    mov ah, [di]
    inc di
    cmp al, ah
    jne .neq
    or al, al
    jz .eq
    jmp .loop
.eq:
    pop di
    pop si
    xor ax, ax      ; ZF = 1
    ret
.neq:
    pop di
    pop si
    mov ax, 1       ; ZF = 0
    or ax, ax
    ret

; Data Section
msg_boot1:  db '[  OK  ] Init Konomi IgnAIte', 13, 10, 0
msg_boot2:  db '[  OK  ] Load kernel modules', 13, 10, 0
msg_boot3:  db '[  OK  ] Mount virtual filesystem', 13, 10, 0
msg_boot4:  db '[  OK  ] Start gateway service', 13, 10, 0
msg_boot5:  db '[  OK  ] All systems ready', 13, 10, 13, 10, 0

msg_logo:   db ' _  __                           _', 13, 10
            db '| |/ / ___  _ __   ___  _ __ ___ (_)', 13, 10
            db '|   < / _ \| ._ \ / _ \| .__` _ \| |', 13, 10
            db '| |\ \ (_) | | | | (_) | | | | | | |', 13, 10
            db '|_| \_\___/|_| |_|\___/|_| |_| |_|_|', 13, 10
            db '      IgnAIte OS v1.0', 13, 10, 13, 10, 0

msg_welcome: db 'Type "help" for commands', 13, 10, 13, 10, 0

prompt:     db 'ignite# ', 0

cmd_help:   db 'help', 0
cmd_clear:  db 'clear', 0
cmd_uname:  db 'uname', 0
cmd_ign:    db 'ignition', 0
cmd_stat:   db 'status', 0
cmd_reboot: db 'reboot', 0

help_text:  db 'Commands:', 13, 10
            db '  help     - Show this help', 13, 10
            db '  clear    - Clear screen', 13, 10
            db '  uname    - System info', 13, 10
            db '  ignition - Gateway info', 13, 10
            db '  status   - System status', 13, 10
            db '  reboot   - Restart system', 13, 10, 0

uname_text: db 'IgnAIte OS 1.0 x86 Konomi', 13, 10, 0

ign_text:   db 'Ignition Gateway 8.1.0', 13, 10
            db 'Status: RUNNING', 13, 10
            db 'Port: 8088', 13, 10
            db 'Modules: Perspective, OPC-UA, Tags', 13, 10, 0

status_text: db 'System Status:', 13, 10
             db '  CPU: x86 Real Mode', 13, 10
             db '  RAM: 640 KB', 13, 10
             db '  Gateway: Active', 13, 10
             db '  Uptime: 00:00:01', 13, 10, 0

msg_unknown: db 'Unknown command. Type "help"', 13, 10, 0
msg_reboot:  db 'Rebooting...', 13, 10, 0

; Command buffer
cmd_buf: times MAX_CMD db 0

; Padding and boot signature
times 510-($-$$) db 0
dw 0xAA55
