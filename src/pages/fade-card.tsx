// src/components/ui/FadeCard.tsx

import React from 'react';
import BlurFade from '@/components/ui/blur-fade';
import { Card } from '@/components/ui/card';

interface FadeCardProps {
  children: React.ReactNode;
  delay?: number; // Tempo de atraso para a animação
  className?: string; // Classes CSS adicionais
}

export const FadeCard: React.FC<FadeCardProps> = ({ children, delay = 0, className = '' }) => (
  <BlurFade delay={delay} inView>
    <Card className={className}>
      {children}
    </Card>
  </BlurFade>
);


