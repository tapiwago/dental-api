$casesToUpdate = @("688be858f44adbf062f20cde", "688be840f44adbf062f20cc3", "688be7bbfadbfbbfb7cbba94", "688be6897d1738983312f03e", "688be542626078be3ea77f35")
$defaultWorkflowTypeId = "689c447882c6f20718e1f3fa"
$updateBody = @{ 
    workflowTypeId = $defaultWorkflowTypeId
    adminId = "507f1f77bcf86cd799439011" 
} | ConvertTo-Json

foreach ($caseId in $casesToUpdate) {
    Write-Output "Updating case: $caseId"
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:5000/api/onboarding-cases/$caseId" -Method PUT -Body $updateBody -ContentType "application/json"
        Write-Output "✅ Updated: $($result.data.caseId)"
    }
    catch {
        Write-Output "❌ Failed to update $caseId : $($_.Exception.Message)"
    }
}
