-- 036_min_withdrawal_setting.sql
-- Adds an admin-editable minimum withdrawal amount (NGN) to site_settings.
-- Editable from /admin/settings. Read at runtime by walletService.getMinWithdrawal().
--
-- Note: Paystack's own minimum NGN transfer is ₦100. Setting a higher platform
-- floor reduces wasted Paystack transfer fees on tiny payouts.

INSERT INTO site_settings (key, value, label, group_name)
VALUES ('min_withdrawal_ngn', '1000', 'Minimum Withdrawal Amount (₦)', 'wallet')
ON CONFLICT (key) DO NOTHING;
