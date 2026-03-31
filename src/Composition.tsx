import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const TARGET = 285_000_000_000;
const TOTAL_FRAMES = 150; // 5s @ 30fps
const SHAKE_START_FRAME = 90; // last 2 seconds

function formatMoney(value: number): string {
	return '$' + Math.floor(value).toLocaleString('en-US');
}

// Deterministic pseudo-random noise keyed by frame — avoids Math.random() re-render flicker
function noise(frame: number, seed: number): number {
	const x = Math.sin(frame * seed + seed * 31.7) * 43758.5453123;
	return x - Math.floor(x); // 0..1
}

export const MyComposition: React.FC = () => {
	const frame = useCurrentFrame();

	// ── Counter ──────────────────────────────────────────────────────────────
	const counterValue = interpolate(frame, [0, TOTAL_FRAMES - 1], [0, TARGET], {
		easing: Easing.inOut(Easing.ease),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const progress = counterValue / TARGET; // 0 → 1

	// ── Glow (text-shadow + radial background) ────────────────────────────────
	const glowRadius = interpolate(progress, [0, 1], [10, 90]);
	const glowOpacity = interpolate(progress, [0, 0.1, 1], [0.08, 0.25, 1]);
	const bgGlowSize = interpolate(progress, [0, 1], [200, 700]);
	const bgGlowOpacity = interpolate(progress, [0, 1], [0.04, 0.28]);

	const textShadow = [
		`0 0 ${glowRadius}px rgba(255, 40, 40, ${glowOpacity})`,
		`0 0 ${glowRadius * 2}px rgba(220, 10, 10, ${glowOpacity * 0.65})`,
		`0 0 ${glowRadius * 3.5}px rgba(180, 0, 0, ${glowOpacity * 0.35})`,
	].join(', ');

	// ── Subtitle fade-in at frame 90 ──────────────────────────────────────────
	const subtitleOpacity = interpolate(frame, [90, 118], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// ── Screen shake (last 2 seconds) — two-frequency for organic feel ────────
	const n1 = noise(frame, 127.1);
	const n2 = noise(frame, 311.7);
	const shakeX =
		frame >= SHAKE_START_FRAME ? (n1 - 0.5) * 3.2 + (n2 - 0.5) * 0.8 : 0;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#000000',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				transform: `translateX(${shakeX}px)`,
			}}
		>
			{/* Radial background glow */}
			<div
				style={{
					position: 'absolute',
					width: bgGlowSize,
					height: bgGlowSize * 0.45,
					borderRadius: '50%',
					background: `radial-gradient(ellipse, rgba(200, 0, 0, ${bgGlowOpacity}) 0%, transparent 70%)`,
					filter: 'blur(40px)',
					pointerEvents: 'none',
				}}
			/>

			{/* Counter */}
			<div
				style={{
					fontFamily:
						'"JetBrains Mono", "Fira Mono", "Courier New", monospace',
					fontSize: 120,
					fontWeight: 700,
					color: '#FFFFFF',
					letterSpacing: -3,
					lineHeight: 1,
					textShadow,
					position: 'relative',
					zIndex: 1,
				}}
			>
				{formatMoney(counterValue)}
			</div>

			{/* Subtitle */}
			<div
				style={{
					marginTop: 52,
					fontFamily: '"Arial", "Helvetica Neue", sans-serif',
					fontSize: 30,
					fontWeight: 700,
					color: '#E94560',
					letterSpacing: 8,
					opacity: subtitleOpacity,
					position: 'relative',
					zIndex: 1,
				}}
			>
				EN UNE SEULE JOURNEE
			</div>
		</AbsoluteFill>
	);
};
