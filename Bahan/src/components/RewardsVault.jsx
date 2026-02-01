import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Wallet, Smartphone, Gift, Lock } from 'lucide-react';

const RewardItem = ({ provider, amount, cost, icon: Icon, color, userPoints }) => {
  const isLocked = userPoints < cost;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isLocked ? 'border-white/5 bg-white/5 opacity-50' : 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} text-white`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">{provider} Rs. {amount}</p>
            <p className="text-[9px] text-zinc-500 font-bold uppercase">{cost} XP REQUIRED</p>
          </div>
        </div>
        {isLocked ? <Lock size={12} className="text-zinc-700" /> : <button className="text-[10px] font-black text-emerald-500 uppercase">Redeem</button>}
      </div>
    </div>
  );
};

const RewardsVault = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-2 mb-4">
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Available Rewards</h3>
        <span className="text-[10px] font-bold text-[#C05621] uppercase">Balance: {user.points} XP</span>
      </div>

      <RewardItem provider="eSewa" amount="50" cost={500} icon={Wallet} color="bg-[#60bb46]" userPoints={user.points} />
      <RewardItem provider="Khalti" amount="50" cost={500} icon={Wallet} color="bg-[#5c2d91]" userPoints={user.points} />
      <RewardItem provider="NTC/Ncell" amount="100" cost={900} icon={Smartphone} color="bg-blue-600" userPoints={user.points} />
      
      <div className="p-4 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2">
        <Gift size={14} className="text-zinc-700" />
        <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">More rewards coming soon</span>
      </div>
    </div>
  );
};

export default RewardsVault;