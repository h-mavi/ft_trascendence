
import nodemailer from 'nodemailer'

// Il transport va creato al primo invio: all'import i segreti di Vault
// non sono ancora in process.env e le credenziali risulterebbero undefined.
let sender = null;

function getSender() {
	if (!sender)
		sender = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.GMAIL_USER,
				pass: process.env.GMAIL_APP_PWD
			}
		});
	return sender;
}

/**
 * @param {Object} params
 * @param {string} params.to - Indirizzo email del destinatario.
 * @param {string} params.subject - Oggetto dell'email.
 * @param {string} params.body - Contenuto dell'email (testo o HTML).
 */
export async function sendEmail({ to, subject, body }) {
	// try {
	return await getSender().sendMail({
		from: '"ChessZ" <' + process.env.GMAIL_USER + '>',
		to: to,
		subject: subject,
		html: body
	});
	// } catch (error) {
	// 	console.log("Error sending mail: ", error);
	// 	throw error;
	// }
}

export function bodyOTP(username, otp) {
	return (`
		<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #f4f4f7; padding: 32px;">
			<div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
				<h2 style="color: #1a1a1a; margin-top: 0;">Ciao ${username}!</h2>
				<p style="color: #4a4a4a; font-size: 15px; line-height: 1.5;">
				Grazie per esserti registrato. Usa il codice qui sotto per verificare il tuo account:
				</p>

				<div style="background-color: #f0f0f5; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
				<span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2d2d2d;">
					${otp}
				</span>
				</div>

				<p style="color: #4a4a4a; font-size: 14px; line-height: 1.5; text-align: center;">
				Il codice scade tra <strong>${process.env.OTP_TTL / 60} minuti</strong>.<br>
				Se non hai richiesto tu la registrazione, ignora pure questa email.
				</p>

				<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">

				<p style="color: #9a9a9a; font-size: 12px; text-align: center; margin: 0;">
				ChessZ &middot; Non rispondere a questa email
				</p>
			</div>
		</div>
	`);
}

export function bodyRegistration(username) {
	return (`
		<div style="background-color: #06050a; padding: 40px 16px; font-family: Georgia, 'Times New Roman', serif;">
	<div style="max-width: 480px; margin: 0 auto; position: relative;">

		<div style="
			background-color: #100e18;
			background-image:
				radial-gradient(circle at 20% 0%, rgba(107, 70, 193, 0.18) 0%, transparent 45%),
				radial-gradient(circle at 80% 100%, rgba(212, 175, 55, 0.10) 0%, transparent 50%),
				linear-gradient(180deg, #1a1625 0%, #0d0b14 100%);
			border: 1px solid #3d2f52;
			border-radius: 4px;
			padding: 2px;
			box-shadow: 0 0 60px rgba(107, 70, 193, 0.2), inset 0 0 40px rgba(0,0,0,0.4);
		">
			<div style="border: 1px solid #2a2438; border-radius: 3px; padding: 44px 32px;">

				<div style="text-align: center; margin-bottom: 20px;">
					<span style="font-size: 42px; text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);">⚔️</span>
				</div>

				<div style="text-align: center; color: #6b4ec1; font-size: 12px; letter-spacing: 6px; margin-bottom: 24px;">
					✦ ✦ ✦
				</div>

				<h1 style="
					color: #d4af37;
					text-align: center;
					font-size: 26px;
					letter-spacing: 3px;
					margin: 0 0 8px 0;
					text-transform: uppercase;
					text-shadow: 0 0 12px rgba(212, 175, 55, 0.35);
				">
					Benvenuto, ${username}
				</h1>
				<p style="color: #8a7f9a; text-align: center; font-size: 13px; font-style: italic; margin: 0 0 32px 0; letter-spacing: 0.5px;">
					Il tuo nome è stato inciso nei registri del regno
				</p>

				<div style="
					border-top: 1px solid #3d2f52;
					border-bottom: 1px solid #3d2f52;
					padding: 24px 4px;
					margin: 24px 0;
					background: rgba(107, 70, 193, 0.04);
				">
					<p style="color: #c4b8d4; font-size: 15px; line-height: 1.7; margin: 0; text-align: center;">
						Il tuo account è stato forgiato con successo.<br>
						Da oggi puoi sfidare avversari, scalare le classifiche<br>
						e conquistare la tua reputazione nell'arena.
					</p>
				</div>

				<div style="text-align: center; margin: 36px 0 28px;">
					<a href="#" style="
						display: inline-block;
						background: linear-gradient(135deg, #8b6914 0%, #d4af37 50%, #8b6914 100%);
						color: #0d0b14;
						text-decoration: none;
						padding: 14px 40px;
						border-radius: 3px;
						font-weight: bold;
						font-size: 14px;
						letter-spacing: 2px;
						text-transform: uppercase;
						box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
						border: 1px solid #f0d878;
					">
						Entra nell'Arena
					</a>
				</div>

				<div style="text-align: center; color: #4a4258; font-size: 12px; letter-spacing: 6px; margin: 28px 0 8px;">
					◆ ◇ ◆
				</div>

				<p style="color: #5a5068; font-size: 12px; line-height: 1.6; text-align: center; margin-top: 16px;">
					Se non hai richiesto tu questo account, ignora pure questa missiva.
				</p>

				<div style="height: 1px; background-color: #2a2438; margin: 24px 0;"></div>

				<p style="color: #4a4258; font-size: 11px; text-align: center; letter-spacing: 2px;">
					✦ ChessZ ✦
				</p>
			</div>
		</div>
	</div>
</div>
	`);
};