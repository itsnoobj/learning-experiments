import type { Metadata } from 'next';
import { GameCanvas } from '@/modules/game';

export const metadata: Metadata = {
  title: 'The Run — A Field Guide to Being Human',
  description: 'Jump the obstacles. Each one is a problem worth solving.',
};

export default function GamePage() {
  return <GameCanvas />;
}
