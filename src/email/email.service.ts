import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private emailUser: string;
  private emailFrom: string;

  constructor(private configService: ConfigService) {
    this.emailUser = this.configService.get<string>('EMAIL_USER') || '';
    this.emailFrom =
      process.env.EMAIL_FROM ||
      `App Moradia <${this.emailUser}>`;

    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || this.emailUser,
        pass: process.env.EMAIL_PASS || this.configService.get<string>('EMAIL_PASS'),
      },
    });

    this.logger.log('📧 EmailService inicializado com Gmail SMTP');
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexão com Gmail SMTP verificada com sucesso');
    } catch (err: any) {
      this.logger.error('❌ Erro na verificação da conexão SMTP:', err.message);
      this.logger.warn('⚠️ Confira EMAIL_USER e EMAIL_PASS no .env');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: this.emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`✅ Email enviado para ${options.to} (id=${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`❌ Falha ao enviar email para ${options.to}: ${err.message}`);
      throw new Error(`Falha no envio de email: ${err.message}`);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    userName?: string,
  ): Promise<boolean> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = this.generatePasswordResetHTML(
      email,
      token,
      userName,
      resetUrl,
    );
    const text = this.generatePasswordResetText(
      email,
      token,
      userName,
      resetUrl,
    );
    return this.sendEmail({
      to: email,
      subject: '🔐 Redefinir Senha - App Moradia',
      text,
      html,
    });
  }

  private generatePasswordResetHTML(email: string, token: string, userName?: string, resetUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - App Moradia</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #2196f3, #1976d2); 
            color: white; 
            text-align: center; 
            padding: 30px 20px; 
          }
          .header h1 { font-size: 24px; margin-bottom: 8px; }
          .header p { opacity: 0.9; font-size: 14px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; color: #2196f3; font-weight: 600; }
          .message { margin-bottom: 25px; }
          .token-section { 
            background: #e3f2fd; 
            border-left: 4px solid #2196f3; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
          }
          .token-label { font-weight: 600; color: #1976d2; margin-bottom: 10px; }
          .token-value { 
            font-family: 'Courier New', monospace; 
            font-size: 16px; 
            background: white; 
            padding: 12px; 
            border-radius: 6px; 
            word-break: break-all; 
            border: 1px solid #bbdefb; 
          }
          .button-section { text-align: center; margin: 30px 0; }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #2196f3, #1976d2); 
            color: white; 
            padding: 14px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px; 
            transition: transform 0.2s; 
          }
          .button:hover { transform: translateY(-2px); }
          .instructions { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
          }
          .instructions h3 { color: #1976d2; margin-bottom: 15px; }
          .instructions ol { padding-left: 20px; }
          .instructions li { margin-bottom: 8px; }
          .warning { 
            background: #fff3e0; 
            border-left: 4px solid #ff9800; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .warning h4 { color: #f57c00; margin-bottom: 10px; }
          .warning ul { padding-left: 20px; }
          .warning li { margin-bottom: 5px; }
          .footer { 
            background: #f8f9fa; 
            text-align: center; 
            padding: 25px; 
            color: #666; 
            font-size: 12px; 
            border-top: 1px solid #e0e0e0; 
          }
          .footer p { margin-bottom: 5px; }
          .security-notice { 
            font-size: 11px; 
            color: #999; 
            margin-top: 15px; 
            font-style: italic; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Redefinição de Senha</h1>
            <p>App Moradia - Sistema de Autenticação</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Olá${userName ? `, ${userName}` : ''}! 👋
            </div>
            
            <div class="message">
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>App Moradia</strong>.</p>
              <p>Use o token de segurança abaixo para criar uma nova senha:</p>
            </div>
            
            <div class="token-section">
              <div class="token-label">🔑 Token de Recuperação:</div>
              <div class="token-value">${token}</div>
            </div>
            
            <div class="instructions">
              <h3>📋 Como usar:</h3>
              <ol>
                <li>Abra o aplicativo <strong>App Moradia</strong></li>
                <li>Vá para a tela de <strong>"Esqueci minha senha"</strong></li>
                <li>Cole o token de recuperação no campo indicado</li>
                <li>Crie sua nova senha segura</li>
                <li>Faça login com suas novas credenciais</li>
              </ol>
            </div>
            
            <div class="warning">
              <h4>⚠️ Informações Importantes:</h4>
              <ul>
                <li><strong>Validade:</strong> Este token expira em 1 hora</li>
                <li><strong>Uso único:</strong> Pode ser usado apenas uma vez</li>
                <li><strong>Segurança:</strong> Não compartilhe este token com ninguém</li>
                <li><strong>Não solicitou?</strong> Ignore este email e sua conta permanecerá segura</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>App Moradia</strong> - Plataforma de Gestão de Moradias</p>
            <p>© 2025 - Todos os direitos reservados</p>
            <div class="security-notice">
              Este é um email automático de segurança. Não responda a esta mensagem.<br>
              Em caso de dúvidas, entre em contato com o suporte técnico.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetText(email: string, token: string, userName?: string, resetUrl?: string): string {
    return `
🔐 REDEFINIÇÃO DE SENHA - APP MORADIA

Olá${userName ? `, ${userName}` : ''}!

Recebemos uma solicitação para redefinir a senha da sua conta.

🔑 TOKEN DE RECUPERAÇÃO:
${token}

📋 COMO USAR:
1. Abra o aplicativo App Moradia
2. Vá para "Esqueci minha senha"
3. Cole o token acima
4. Crie sua nova senha
5. Faça login normalmente

${resetUrl ? `🔗 LINK DIRETO: ${resetUrl}\n` : ''}

⚠️ IMPORTANTE:
- Token válido por 1 hora
- Use apenas uma vez
- Não compartilhe com ninguém
- Não solicitou? Ignore este email

---
App Moradia © 2025
Este é um email automático. Não responda.
Suporte: contato@appmoradia.com
    `.trim();
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.verify();
      return {
        success: true,
        message: '✅ Conexão com Office365 funcionando perfeitamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Erro na conexão: ${error.message}`
      };
    }
  }
}
