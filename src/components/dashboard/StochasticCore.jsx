import React, { useState, useEffect, useRef } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

const StochasticCore = () => {
    const { profile, scopedMonteCarlo, planningScope } = useScopedWealth();
    const [isCalculating, setIsCalculating] = useState(false);
    const canvasRef = useRef(null);
    const successRate = (scopedMonteCarlo && scopedMonteCarlo.length > 0) ? (scopedMonteCarlo[0].successRate ?? 100) : 100;

    // Trigger visual simulation when profile changes
    useEffect(() => {
        setIsCalculating(true);
        const timer = setTimeout(() => setIsCalculating(false), 1500);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const width = canvas.width;
        const height = canvas.height;
        const paths = Array.from({ length: 40 }, () => ({
            points: [height / 2],
            color: Math.random() > 0.5 ? 'hsla(var(--bull-case) / 0.4)' : 'hsla(var(--bear-case) / 0.4)',
            speed: 0.5 + Math.random() * 2,
            volatility: 2 + Math.random() * 5
        }));

        let x = 0;
        const animate = () => {
            if (x > width) return;

            ctx.clearRect(width - 40, 0, 40, height); // Soft clear trail

            paths.forEach(p => {
                const lastY = p.points[p.points.length - 1];
                const change = (Math.random() - 0.5) * p.volatility;
                const newY = Math.max(10, Math.min(height - 10, lastY + change));

                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1;
                ctx.moveTo(x, lastY);
                ctx.lineTo(x + 2, newY);
                ctx.stroke();

                p.points.push(newY);
            });

            x += 2;
            animationFrame = requestAnimationFrame(animate);
        };

        ctx.clearRect(0, 0, width, height);
        animate();

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(animationFrame);
        };
    }, [profile, planningScope]);

    return (
        <div className="glass-panel" style={{
            padding: 'var(--space-4)',
            position: 'relative',
            overflow: 'hidden',
            border: isCalculating ? '1px solid hsla(var(--gold-primary) / 0.3)' : '1px solid hsla(var(--text-primary) / 0.05)',
            transition: 'all 0.4s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isCalculating ? 'hsl(var(--gold-primary))' : 'hsl(var(--success))',
                        boxShadow: isCalculating ? '0 0 10px hsl(var(--gold-primary))' : 'none',
                        animation: isCalculating ? 'pulse-gold 1s infinite' : 'none'
                    }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Stochastic Engine Core
                    </span>
                </div>
                {isCalculating && (
                    <div style={{ fontSize: '0.6rem', color: 'hsl(var(--gold-primary))', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={10} /> PROCESSING...
                    </div>
                )}
            </div>

            <div style={{ position: 'relative', height: '80px', background: 'hsla(var(--bg-void) / 0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid hsla(var(--text-primary) / 0.03)' }}>
                <canvas
                    ref={canvasRef}
                    width={280}
                    height={80}
                    style={{ width: '100%', height: '100%', opacity: isCalculating ? 1 : 0.4, transition: 'opacity 0.5s' }}
                />

                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', textShadow: '0 0 20px black' }}>
                        {successRate}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'hsl(var(--gold-primary))', fontWeight: 700, textTransform: 'uppercase' }}>
                        Safety Confidence
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 'var(--space-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <div style={{ background: 'hsla(var(--text-primary) / 0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'hsl(var(--text-dim))', textTransform: 'uppercase' }}>Iterations</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>250</div>
                </div>
                <div style={{ background: 'hsla(var(--text-primary) / 0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'hsl(var(--text-dim))', textTransform: 'uppercase' }}>Variables</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>18</div>
                </div>
            </div>
        </div>
    );
};

export default StochasticCore;
